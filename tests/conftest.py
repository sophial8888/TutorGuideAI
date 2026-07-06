import os

os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault("SUPABASE_JWT_SECRET", "test-jwt-secret-that-is-long-enough-for-hs256")
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")

import pytest

import app as app_module


@pytest.fixture
def flask_app():
    app_module.app.config["TESTING"] = True
    return app_module.app


@pytest.fixture
def client(flask_app):
    return flask_app.test_client()


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    app_module.limiter.reset()
    yield


@pytest.fixture
def mock_groq(monkeypatch):
    """Patch app.client.chat.completions.create to return a canned reply."""

    def _install(content="Mocked reply.", raise_error=None):
        def fake_create(*args, **kwargs):
            if raise_error is not None:
                raise raise_error
            return type(
                "FakeResponse",
                (),
                {"choices": [type("Choice", (), {"message": type("Msg", (), {"content": content})()})()]},
            )()

        monkeypatch.setattr(app_module.client.chat.completions, "create", fake_create)

    return _install
