import pytest
from auth.security import hash_password, verify_password, create_access_token, decode_access_token


def test_password_hashing():
    pw = "SecretPassword123!"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_flow():
    user_data = {"sub": "user-123-abc", "email": "test@tradersworld.ai"}
    token = create_access_token(user_data)
    assert token is not None

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user-123-abc"
    assert decoded["email"] == "test@tradersworld.ai"
