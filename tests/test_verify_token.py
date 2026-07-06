import time

import jwt as pyjwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec

import app as app_module


def make_hs256_token(sub="user-123", secret="test-jwt-secret-that-is-long-enough-for-hs256", audience="authenticated", expired=False):
    now = int(time.time())
    payload = {
        "sub": sub,
        "aud": audience,
        "iat": now,
        "exp": now - 10 if expired else now + 3600,
    }
    return pyjwt.encode(payload, secret, algorithm="HS256")


class FakeSigningKey:
    def __init__(self, key):
        self.key = key


def test_no_authorization_header(client):
    with app_module.app.test_request_context("/chat"):
        assert app_module.verify_token() is None


def test_malformed_authorization_header(client):
    with app_module.app.test_request_context("/chat", headers={"Authorization": "Basic abc123"}):
        assert app_module.verify_token() is None


def test_valid_hs256_token_returns_sub(client):
    token = make_hs256_token(sub="user-abc")
    with app_module.app.test_request_context("/chat", headers={"Authorization": f"Bearer {token}"}):
        assert app_module.verify_token() == "user-abc"


def test_hs256_token_wrong_secret_rejected(client):
    token = make_hs256_token(secret="wrong-secret")
    with app_module.app.test_request_context("/chat", headers={"Authorization": f"Bearer {token}"}):
        assert app_module.verify_token() is None


def test_expired_token_rejected(client):
    token = make_hs256_token(expired=True)
    with app_module.app.test_request_context("/chat", headers={"Authorization": f"Bearer {token}"}):
        assert app_module.verify_token() is None


def test_wrong_audience_rejected(client):
    token = make_hs256_token(audience="not-authenticated")
    with app_module.app.test_request_context("/chat", headers={"Authorization": f"Bearer {token}"}):
        assert app_module.verify_token() is None


def test_garbage_token_rejected(client):
    with app_module.app.test_request_context("/chat", headers={"Authorization": "Bearer not-a-real-jwt"}):
        assert app_module.verify_token() is None


def test_valid_es256_token_via_jwks_returns_sub(client, monkeypatch):
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()

    now = int(time.time())
    payload = {"sub": "user-es256", "aud": "authenticated", "iat": now, "exp": now + 3600}
    token = pyjwt.encode(payload, private_key, algorithm="ES256")

    fake_jwks_client = type(
        "FakeJWKS", (), {"get_signing_key_from_jwt": lambda self, t: FakeSigningKey(public_key)}
    )()
    monkeypatch.setattr(app_module, "_jwks_client", fake_jwks_client)

    with app_module.app.test_request_context("/chat", headers={"Authorization": f"Bearer {token}"}):
        assert app_module.verify_token() == "user-es256"


def test_es256_token_without_jwks_client_configured_rejected(client, monkeypatch):
    private_key = ec.generate_private_key(ec.SECP256R1())
    now = int(time.time())
    payload = {"sub": "user-es256", "aud": "authenticated", "iat": now, "exp": now + 3600}
    token = pyjwt.encode(payload, private_key, algorithm="ES256")

    monkeypatch.setattr(app_module, "_jwks_client", None)

    with app_module.app.test_request_context("/chat", headers={"Authorization": f"Bearer {token}"}):
        assert app_module.verify_token() is None
