"""Password hashing helpers."""

from pwdlib import PasswordHash

_password_hasher = PasswordHash.recommended()


def hash_password(plain_password: str) -> str:
    """Return a one-way Argon2id password hash."""
    return _password_hasher.hash(plain_password)


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Return True when the password matches the stored hash."""
    return _password_hasher.verify(plain_password, stored_hash)