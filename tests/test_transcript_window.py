import app as app_module
from app import TRANSCRIPT_HEAD_CHARS, TRANSCRIPT_TAIL_CHARS, window_transcript
from tests.test_chat_route import auth_header


def test_short_transcript_is_unchanged():
    assert window_transcript("x plus two equals eight") == "x plus two equals eight"


def test_long_transcript_keeps_start_and_latest():
    start = "S" * TRANSCRIPT_HEAD_CHARS
    middle = "M" * 10_000
    latest = "L" * TRANSCRIPT_TAIL_CHARS
    result = window_transcript(start + middle + latest)
    assert result.startswith(start)
    assert result.endswith(latest)
    assert "M" not in result
    assert "middle of session skipped" in result


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
