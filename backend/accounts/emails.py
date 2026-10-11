from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail


def generate_reset_token(user):
    return default_token_generator.make_token(user)


def build_reset_url(user, token, uid):
    frontend = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    return f"{frontend}/reset-password?uid={uid}&token={token}"


def send_password_reset_email(user, reset_url):
    subject = "Reset your password"
    message = (
        f"Hi {user.name or user.username},\n\n"
        "Someone requested a password reset for your account.\n"
        "Click the link below to set a new password (valid for 1 hour):\n\n"
        f"{reset_url}\n\n"
        "If you didn't request this, you can safely ignore this email.\n"
    )
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
