import logging
import re
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)

PASSWORD_MIN_LENGTH = 8
PASSWORD_STRENGTH_MESSAGE = (
    "Password must be at least 8 characters long and include at least 1 uppercase letter and 1 number"
)
PASSWORD_STRENGTH_REGEX = re.compile(r"^(?=.*[A-Z])(?=.*\d).+$")
TICKET_DOWNLOAD_TOKEN_EXPIRE_MINUTES = 5


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_strength_error(password: str) -> str | None:
    if len(password) < PASSWORD_MIN_LENGTH:
        return PASSWORD_STRENGTH_MESSAGE
    if not PASSWORD_STRENGTH_REGEX.search(password):
        return PASSWORD_STRENGTH_MESSAGE
    return None


def _create_token(data: dict, token_type: str, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire, "type": token_type})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    return _create_token(
        data=data,
        token_type="access",
        expires_delta=expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_ticket_download_token(data: dict, expires_delta: timedelta | None = None) -> str:
    return _create_token(
        data=data,
        token_type="ticket_download",
        expires_delta=expires_delta
        or timedelta(minutes=TICKET_DOWNLOAD_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(data: dict) -> str:
    return _create_token(
        data=data,
        token_type="refresh",
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


def create_verification_token(user_id: str, email: str, token_jti: str) -> str:
    return _create_token(
        data={"sub": user_id, "email": email, "jti": token_jti},
        token_type="verify",
        expires_delta=timedelta(hours=24),
    )


def create_password_reset_token(user_id: str, email: str, token_jti: str) -> str:
    return _create_token(
        data={"sub": user_id, "email": email, "jti": token_jti},
        token_type="password_reset",
        expires_delta=timedelta(minutes=30),
    )


def decode_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def generate_numeric_code(length: int = 6) -> str:
    max_range = 10**length
    return f"{secrets.randbelow(max_range):0{length}d}"


def send_verification_email(email: str, code: str, token: str) -> None:
    _send_email(
        to_email=email,
        subject="BNConcert - Verify your email",
        body=(
            "Use this verification code to activate your BNConcert account:\n\n"
            f"{code}\n\n"
            "Or use this token:\n"
            f"{token}\n"
        ),
        fallback_context=f"Verification email queued for {email} | code={code} | token={token}",
    )


def send_password_reset_email(email: str, code: str, token: str) -> None:
    _send_email(
        to_email=email,
        subject="BNConcert - Password reset",
        body=(
            "Use this code to reset your BNConcert password:\n\n"
            f"{code}\n\n"
            "Or reset with this token:\n"
            f"{token}\n"
        ),
        fallback_context=f"Password reset email queued for {email} | code={code} | token={token}",
    )


def _send_email(to_email: str, subject: str, body: str, fallback_context: str) -> None:
    if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
        logger.info(fallback_context)
        return

    message = EmailMessage()
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)
    except Exception:
        logger.exception("Failed to send auth email via SMTP")
        logger.info(fallback_context)
