from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class AuthAPITests(TestCase):
    def setUp(self):
        from django.core.cache import cache

        cache.clear()
        self.client = APIClient()
        self.register_url = "/api/auth/register"
        self.login_url = "/api/auth/login"
        self.me_url = "/api/auth/me"
        self.logout_url = "/api/auth/logout"
        self.user_data = {
            "username": "janedoe",
            "email": "jane@example.com",
            "name": "Jane Doe",
            "password": "Str0ng-Passw0rd!23",
        }

    def test_register_returns_tokens_and_user(self):
        res = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)
        self.assertEqual(res.data["user"]["email"], "jane@example.com")
        self.assertNotIn("password", res.data["user"])

    def test_register_duplicate_email_fails(self):
        User.objects.create_user(
            username="other",
            email="jane@example.com",
            password="Str0ng-Passw0rd!23",
        )
        res = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password_fails(self):
        data = {**self.user_data, "password": "123"}
        res = self.client.post(self.register_url, data, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        User.objects.create_user(
            username="janedoe",
            email="jane@example.com",
            password="Str0ng-Passw0rd!23",
        )
        res = self.client.post(
            self.login_url,
            {"email": "jane@example.com", "password": "Str0ng-Passw0rd!23"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)

    def test_login_wrong_password(self):
        User.objects.create_user(
            username="janedoe",
            email="jane@example.com",
            password="Str0ng-Passw0rd!23",
        )
        res = self.client.post(
            self.login_url,
            {"email": "jane@example.com", "password": "wrong-password"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requires_auth(self):
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_current_user(self):
        user = User.objects.create_user(
            username="janedoe",
            email="jane@example.com",
            password="Str0ng-Passw0rd!23",
        )
        self.client.force_authenticate(user=user)
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["email"], "jane@example.com")

    def test_logout_blacklists_refresh(self):
        User.objects.create_user(
            username="janedoe",
            email="jane@example.com",
            password="Str0ng-Passw0rd!23",
        )
        res = self.client.post(
            self.login_url,
            {"email": "jane@example.com", "password": "Str0ng-Passw0rd!23"},
            format="json",
        )
        refresh = res.data["refresh"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
        res = self.client.post(self.logout_url, {"refresh": refresh}, format="json")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        res = self.client.post(
            "/api/auth/refresh", {"refresh": refresh}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


@override_settings(DEBUG=True)
class PasswordResetTests(TestCase):
    def setUp(self):
        from django.core.cache import cache

        cache.clear()
        self.client = APIClient()
        self.request_url = "/api/auth/password-reset"
        self.confirm_url = "/api/auth/password-reset/confirm"
        self.user = User.objects.create_user(
            username="resetuser",
            email="reset@example.com",
            password="OldPass123!xyz",
        )

    def _get_reset_link(self):
        res = self.client.post(
            self.request_url, {"email": "reset@example.com"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("reset_url", res.data)
        from urllib.parse import parse_qs, urlparse

        qs = parse_qs(urlparse(res.data["reset_url"]).query)
        return qs["uid"][0], qs["token"][0]

    def test_reset_request_returns_link_for_existing_user(self):
        uid, token = self._get_reset_link()
        self.assertTrue(uid)
        self.assertTrue(token)

    def test_reset_request_hides_unknown_email(self):
        res = self.client.post(
            self.request_url, {"email": "nobody@example.com"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertNotIn("reset_url", res.data)

    def test_confirm_sets_new_password(self):
        uid, token = self._get_reset_link()
        res = self.client.post(
            self.confirm_url,
            {"uid": uid, "token": token, "password": "BrandNewPass456!"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("BrandNewPass456!"))
        self.assertFalse(self.user.check_password("OldPass123!xyz"))

    def test_old_password_rejected_after_reset(self):
        uid, token = self._get_reset_link()
        self.client.post(
            self.confirm_url,
            {"uid": uid, "token": token, "password": "BrandNewPass456!"},
            format="json",
        )
        res = self.client.post(
            "/api/auth/login",
            {"email": "reset@example.com", "password": "OldPass123!xyz"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_new_password_allows_login(self):
        uid, token = self._get_reset_link()
        self.client.post(
            self.confirm_url,
            {"uid": uid, "token": token, "password": "BrandNewPass456!"},
            format="json",
        )
        res = self.client.post(
            "/api/auth/login",
            {"email": "reset@example.com", "password": "BrandNewPass456!"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_token_cannot_be_reused(self):
        uid, token = self._get_reset_link()
        self.client.post(
            self.confirm_url,
            {"uid": uid, "token": token, "password": "BrandNewPass456!"},
            format="json",
        )
        res = self.client.post(
            self.confirm_url,
            {"uid": uid, "token": token, "password": "AnotherPass789!"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_token_rejected(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        res = self.client.post(
            self.confirm_url,
            {"uid": uid, "token": "not-a-real-token", "password": "Whatever123!"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_weak_password_rejected(self):
        uid, token = self._get_reset_link()
        res = self.client.post(
            self.confirm_url,
            {"uid": uid, "token": token, "password": "123"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
