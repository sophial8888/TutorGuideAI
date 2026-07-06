import app as app_module


def test_sanitize_strips_whitespace():
    assert app_module.sanitize("  hello  ") == "hello"


def test_sanitize_removes_control_characters_but_keeps_newlines_tabs():
    value = "a\x00b\x1fc\nd\te"
    assert app_module.sanitize(value) == "abc\nd\te"


def test_sanitize_enforces_max_length():
    assert app_module.sanitize("x" * 10, max_length=5) == "xxxxx"


def test_sanitize_rejects_non_string_input():
    assert app_module.sanitize(None) == ""
    assert app_module.sanitize(123) == ""
    assert app_module.sanitize(["a", "b"]) == ""


def test_build_system_prompt_includes_subject_and_topic():
    prompt = app_module.build_system_prompt("Algebra", "Quadratics", "", [])
    assert "Algebra" in prompt
    assert "Quadratics" in prompt


def test_build_system_prompt_includes_known_feelings():
    prompt = app_module.build_system_prompt("", "", "", ["Confused"])
    assert "Confused" in prompt
    assert "Simplify your language" in prompt


def test_build_system_prompt_ignores_unknown_feelings_gracefully():
    prompt = app_module.build_system_prompt("", "", "", [])
    assert "STUDENT STATE" not in prompt
