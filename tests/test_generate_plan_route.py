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
    resp = client.options("/generate-plan")
    assert resp.status_code == 200


def test_missing_auth_returns_401(client):
    resp = client.post("/generate-plan", json={"subject": "Algebra", "topic": "Factoring"})
    assert resp.status_code == 401


def test_missing_subject_or_topic_returns_400(client):
    resp = client.post("/generate-plan", json={"subject": "Algebra"}, headers=auth_header())
    assert resp.status_code == 400

    resp = client.post("/generate-plan", json={"topic": "Factoring"}, headers=auth_header())
    assert resp.status_code == 400


def test_happy_path_returns_plan(client, mock_groq):
    mock_groq(content="1. Warm up with review problems.\n2. Introduce factoring.")
    resp = client.post(
        "/generate-plan",
        json={"subject": "Algebra", "topic": "Factoring"},
        headers=auth_header(),
    )
    assert resp.status_code == 200
    assert "Warm up" in resp.get_json()["plan"]


def test_groq_rate_limit_error_returns_429(client, mock_groq):
    mock_groq(raise_error=RuntimeError("Error code: 429 - rate_limit_exceeded"))
    resp = client.post(
        "/generate-plan", json={"subject": "Algebra", "topic": "Factoring"}, headers=auth_header()
    )
    assert resp.status_code == 429


def test_exceeding_rate_limit_returns_429(client, mock_groq):
    mock_groq(content="ok")
    last_status = None
    for _ in range(11):
        last_status = client.post(
            "/generate-plan", json={"subject": "Algebra", "topic": "Factoring"}, headers=auth_header()
        ).status_code
    assert last_status == 429
