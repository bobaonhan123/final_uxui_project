from pydantic import BaseModel, EmailStr, Field, model_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class VerifyEmailRequest(BaseModel):
    token: str | None = None
    email: EmailStr | None = None
    code: str | None = Field(default=None, pattern=r"^\d{6}$")

    @model_validator(mode="after")
    def validate_identity(self):
        if self.token:
            return self
        if self.email and self.code:
            return self
        raise ValueError("Provide either token or both email and 6-digit code")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str | None = None
    email: EmailStr | None = None
    code: str | None = Field(default=None, pattern=r"^\d{6}$")
    new_password: str
    confirm_password: str

    @model_validator(mode="after")
    def validate_reset_payload(self):
        if not self.token and not (self.email and self.code):
            raise ValueError("Provide either token or both email and 6-digit code")
        if self.new_password != self.confirm_password:
            raise ValueError("New password and confirm password do not match")
        return self


class MessageResponse(BaseModel):
    message: str
