import os
import sys
import unittest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, get_db
from app.main import app


class AuthenticationApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(bind=cls.engine)
        cls.session_factory = sessionmaker(bind=cls.engine, autoflush=False, autocommit=False)

        def override_get_db():
            db = cls.session_factory()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()
        cls.engine.dispose()

    def test_registration_login_and_token_protection(self):
        invalid_password = self.client.post(
            "/api/auth/register",
            json={
                "email": "invalid@example.com",
                "username": "invalid.user",
                "full_name": "Invalid User",
                "password": "é" * 37,
            },
        )
        self.assertEqual(invalid_password.status_code, 422)

        registration = self.client.post(
            "/api/auth/register",
            json={
                "email": " Staff@Example.com ",
                "username": "New.User",
                "full_name": " New Staff Member ",
                "department": " Research ",
                "password": "Password!123",
                "role": "Admin",
            },
        )
        self.assertEqual(registration.status_code, 201)
        registered_user = registration.json()["user"]
        self.assertEqual(registered_user["email"], "staff@example.com")
        self.assertEqual(registered_user["username"], "new.user")
        self.assertEqual(registered_user["full_name"], "New Staff Member")
        self.assertEqual(registered_user["department"], "Research")
        self.assertEqual(registered_user["role"], "Employee")

        token = registration.json()["access_token"]
        profile = self.client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(profile.status_code, 200)
        self.assertEqual(profile.json()["username"], "new.user")

        restricted_users = self.client.get(
            "/api/users",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(restricted_users.status_code, 403)

        login = self.client.post(
            "/api/auth/login",
            json={"username": "new.user", "password": "Password!123"},
        )
        self.assertEqual(login.status_code, 200)
        self.assertEqual(login.json()["user"]["role"], "Employee")

        duplicate = self.client.post(
            "/api/auth/register",
            json={
                "email": "staff@example.com",
                "username": "another.user",
                "full_name": "Another User",
                "password": "Password!123",
            },
        )
        self.assertEqual(duplicate.status_code, 409)

        unauthenticated = self.client.get("/api/auth/me")
        self.assertEqual(unauthenticated.status_code, 401)


if __name__ == "__main__":
    unittest.main()
