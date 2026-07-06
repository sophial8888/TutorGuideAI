import time

import jwt as pyjwt


def auth_header(sub="user-123", secret="test-jwt-secret-that-is-long-enough-for-hs256"):
    now = int(time.time())
    token = pyjwt.encode(
        {"sub": sub, "aud": "authenticated", "iat": now, "exp": now + 3600},
        secret,
        algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}"}


def test_options_request_does_not_require_auth(client):
    resp = client.options("/chat")
    assert resp.status_code == 200


def test_missing_auth_returns_401(client, mock_groq):
    mock_groq()
    resp = client.post("/chat", json={"messages": []})
    assert resp.status_code == 401


def test_invalid_body_returns_400(client):
    resp = client.post("/chat", data="not json", content_type="text/plain", headers=auth_header())
    assert resp.status_code == 400


def test_messages_not_a_list_returns_400(client):
    resp = client.post("/chat", json={"messages": "nope"}, headers=auth_header())
    assert resp.status_code == 400


def test_too_many_messages_returns_400(client):
    resp = client.post("/chat", json={"messages": [{"role": "user", "content": "hi"}] * 101}, headers=auth_header())
    assert resp.status_code == 400


def test_happy_path_returns_reply(client, mock_groq):
    mock_groq(content="Try breaking the problem into smaller steps.")
    resp = client.post(
        "/chat",
        json={
            "messages": [{"role": "user", "content": "The student is stuck on factoring."}],
            "subject": "Algebra",
            "topic": "Factoring",
            "feelings": ["Frustrated"],
        },
        headers=auth_header(),
    )
    assert resp.status_code == 200
    assert resp.get_json()["reply"] == "Try breaking the problem into smaller steps."


def test_malformed_messages_are_dropped_not_errored(client, mock_groq):
    mock_groq(content="ok")
    resp = client.post(
        "/chat",
        json={"messages": [{"role": "not-allowed", "content": "hi"}, "not-a-dict", {"role": "user"}]},
        headers=auth_header(),
    )
    assert resp.status_code == 200


def test_groq_rate_limit_error_returns_429(client, mock_groq):
    mock_groq(raise_error=RuntimeError("Error code: 429 - rate_limit_exceeded"))
    resp = client.post("/chat", json={"messages": []}, headers=auth_header())
    assert resp.status_code == 429


def test_groq_generic_error_returns_500(client, mock_groq):
    mock_groq(raise_error=RuntimeError("boom"))
    resp = client.post("/chat", json={"messages": []}, headers=auth_header())
    assert resp.status_code == 500


def test_exceeding_rate_limit_returns_429(client, mock_groq):
    mock_groq(content="ok")
    last_status = None
    for _ in range(31):
        last_status = client.post("/chat", json={"messages": []}, headers=auth_header()).status_code
    assert last_status == 429
