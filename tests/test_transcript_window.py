import app as app_module
from app import TRANSCRIPT_HEAD_CHARS, TRANSCRIPT_TAIL_CHARS, latest_transcript_lines, window_transcript
from tests.test_chat_route import auth_header


def test_short_transcript_is_unchanged():
    assert window_transcript("x plus two equals eight") == "x plus two equals eight"


def test_long_transcript_keeps_start_and_latest():
    start = "S" * TRANSCRIPT_HEAD_CHARS
    middle = "M" * 10_000
    latest = "L" * TRANSCRIPT_TAIL_CHARS
    result = window_transcript(start + middle + latest)
    assert result.endswith(latest)
    assert start in result
    assert "M" not in result.replace("EARLIER", "").replace("LATEST", "")
    assert "middle of session skipped" in result
    assert result.index("EARLIER") < result.index(start) < result.index("LATEST") < result.index(latest)


def test_chat_sends_latest_transcript_to_model(client, monkeypatch):
    captured = {}

    def fake_create(*args, **kwargs):
        captured["messages"] = kwargs["messages"]
        msg = type("Msg", (), {"content": "ok"})()
        return type("R", (), {"choices": [type("C", (), {"message": msg})()]})()

    monkeypatch.setattr(app_module.client.chat.completions, "create", fake_create)
    transcript = "today we solve x plus two equals eight " + ("filler " * 3000) + "student: do I subtract from both sides"
    resp = client.post("/chat", json={"messages": [], "transcript": transcript}, headers=auth_header())

    assert resp.status_code == 200
    system = captured["messages"][0]["content"]
    assert "today we solve x plus two equals eight" in system
    assert "do I subtract from both sides" in system


def test_latest_lines_keeps_only_newest():
    text = "\n".join(f"[13:5{i % 10}] line {i}" for i in range(30))
    result = latest_transcript_lines(text)
    assert "line 29" in result
    assert "line 20" in result
    assert "line 19" not in result


def test_newest_lines_are_attached_to_the_request(client, monkeypatch):
    captured = {}

    def fake_create(*args, **kwargs):
        captured["messages"] = kwargs["messages"]
        msg = type("Msg", (), {"content": "ok"})()
        return type("R", (), {"choices": [type("C", (), {"message": msg})()]})()

    monkeypatch.setattr(app_module.client.chat.completions, "create", fake_create)
    transcript = "[13:57] two x minus nine equals twelve\n[13:58] let's move on to the next one\n[13:58] x plus two equals five"
    resp = client.post(
        "/chat",
        json={"messages": [{"role": "user", "content": "[Hint]"}], "transcript": transcript},
        headers=auth_header(),
    )

    assert resp.status_code == 200
    last = captured["messages"][-1]["content"]
    assert last.startswith("[Hint]")
    assert "RIGHT NOW" in last
    assert last.index("x plus two equals five") > last.index("two x minus nine")
    assert "Working on:" in last
