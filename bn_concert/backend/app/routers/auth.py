from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.auth_code import AuthCode, AuthCodePurpose
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyEmailRequest,
)
from app.services.auth_service import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    create_verification_token,
    decode_token,
    generate_numeric_code,
    get_password_strength_error,
    hash_password,
    send_password_reset_email,
    send_verification_email,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
GENERIC_FORGOT_PASSWORD_MESSAGE = (
    "If an account with that email exists, a password reset code has been sent"
)


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _coerce_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _issue_auth_code(db: Session, user: User, purpose: AuthCodePurpose) -> tuple[AuthCode, str]:
    now = _now_utc()
    db.query(AuthCode).filter(
        AuthCode.user_id == user.id,
        AuthCode.purpose == purpose,
        AuthCode.consumed_at.is_(None),
    ).update({"consumed_at": now}, synchronize_session=False)

    code = generate_numeric_code()
    token_jti = str(uuid4())
    expires_delta = timedelta(hours=24) if purpose == AuthCodePurpose.EMAIL_VERIFICATION else timedelta(minutes=30)
    expires_at = now + expires_delta

    if purpose == AuthCodePurpose.EMAIL_VERIFICATION:
        token = create_verification_token(user.id, user.email, token_jti)
    else:
        token = create_password_reset_token(user.id, user.email, token_jti)

    auth_code = AuthCode(
        user_id=user.id,
        email=user.email,
        purpose=purpose,
        code=code,
        token_jti=token_jti,
        expires_at=expires_at,
    )
    db.add(auth_code)
    return auth_code, token


def _get_auth_code_by_token(
    db: Session,
    token: str,
    expected_type: str,
    purpose: AuthCodePurpose,
    invalid_detail: str,
) -> AuthCode:
    payload = decode_token(token)
    if not payload or payload.get("type") != expected_type:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=invalid_detail)

    user_id = payload.get("sub")
    token_jti = payload.get("jti")
    if not user_id or not token_jti:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=invalid_detail)

    auth_code = (
        db.query(AuthCode)
        .filter(
            AuthCode.user_id == user_id,
            AuthCode.token_jti == token_jti,
            AuthCode.purpose == purpose,
        )
        .first()
    )
    if not auth_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=invalid_detail)
    return auth_code


def _get_auth_code_by_email_and_code(
    db: Session,
    email: str,
    code: str,
    purpose: AuthCodePurpose,
    invalid_detail: str,
) -> AuthCode:
    auth_code = (
        db.query(AuthCode)
        .filter(
            func.lower(AuthCode.email) == _normalize_email(email),
            AuthCode.code == code,
            AuthCode.purpose == purpose,
        )
        .order_by(AuthCode.created_at.desc())
        .first()
    )
    if not auth_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=invalid_detail)
    return auth_code


def _assert_auth_code_is_active(
    auth_code: AuthCode,
    expired_detail: str,
    invalid_detail: str,
) -> None:
    if auth_code.consumed_at is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=invalid_detail)
    if _coerce_utc(auth_code.expires_at) < _now_utc():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=expired_detail)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    normalized_email = _normalize_email(str(body.email))
    existing = db.query(User).filter(func.lower(User.email) == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    password_error = get_password_strength_error(body.password)
    if password_error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=password_error)

    user = User(
        email=normalized_email,
        hashed_password=hash_password(body.password),
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
    )
    db.add(user)
    db.flush()

    verification_code, verification_token = _issue_auth_code(
        db=db,
        user=user,
        purpose=AuthCodePurpose.EMAIL_VERIFICATION,
    )

    db.commit()
    db.refresh(user)
    send_verification_email(user.email, verification_code.code, verification_token)

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    normalized_email = _normalize_email(str(body.email))
    user = db.query(User).filter(func.lower(User.email) == normalized_email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    access_token = create_access_token({"sub": user.id})
    new_refresh = create_refresh_token({"sub": user.id})
    return TokenResponse(access_token=access_token, refresh_token=new_refresh)


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(body: VerifyEmailRequest, db: Session = Depends(get_db)):
    if body.token:
        auth_code = _get_auth_code_by_token(
            db=db,
            token=body.token,
            expected_type="verify",
            purpose=AuthCodePurpose.EMAIL_VERIFICATION,
            invalid_detail="Invalid verification token",
        )
    else:
        auth_code = _get_auth_code_by_email_and_code(
            db=db,
            email=str(body.email),
            code=body.code or "",
            purpose=AuthCodePurpose.EMAIL_VERIFICATION,
            invalid_detail="Invalid verification code",
        )

    _assert_auth_code_is_active(
        auth_code,
        expired_detail="Verification code has expired",
        invalid_detail="Verification code already used or invalid",
    )

    user = db.query(User).filter(User.id == auth_code.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    user.is_verified = True
    auth_code.consumed_at = _now_utc()
    db.commit()
    return MessageResponse(message="Email verified successfully")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    normalized_email = _normalize_email(str(body.email))
    user = (
        db.query(User)
        .filter(
            func.lower(User.email) == normalized_email,
            User.is_active.is_(True),
        )
        .first()
    )

    if not user:
        return MessageResponse(message=GENERIC_FORGOT_PASSWORD_MESSAGE)

    reset_code, reset_token = _issue_auth_code(
        db=db,
        user=user,
        purpose=AuthCodePurpose.PASSWORD_RESET,
    )
    db.commit()
    send_password_reset_email(user.email, reset_code.code, reset_token)
    return MessageResponse(message=GENERIC_FORGOT_PASSWORD_MESSAGE)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    password_error = get_password_strength_error(body.new_password)
    if password_error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=password_error)

    if body.token:
        auth_code = _get_auth_code_by_token(
            db=db,
            token=body.token,
            expected_type="password_reset",
            purpose=AuthCodePurpose.PASSWORD_RESET,
            invalid_detail="Invalid reset token",
        )
    else:
        auth_code = _get_auth_code_by_email_and_code(
            db=db,
            email=str(body.email),
            code=body.code or "",
            purpose=AuthCodePurpose.PASSWORD_RESET,
            invalid_detail="Invalid reset code",
        )

    _assert_auth_code_is_active(
        auth_code,
        expired_detail="Reset code has expired",
        invalid_detail="Reset code already used or invalid",
    )

    user = db.query(User).filter(User.id == auth_code.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
    if verify_password(body.new_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password",
        )

    now = _now_utc()
    user.hashed_password = hash_password(body.new_password)
    auth_code.consumed_at = now

    db.query(AuthCode).filter(
        AuthCode.user_id == user.id,
        AuthCode.purpose == AuthCodePurpose.PASSWORD_RESET,
        AuthCode.consumed_at.is_(None),
        AuthCode.id != auth_code.id,
    ).update({"consumed_at": now}, synchronize_session=False)

    db.commit()
    return MessageResponse(message="Password reset successfully")
