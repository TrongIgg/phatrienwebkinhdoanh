from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_login() -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "dev@example.com", "password": "secret123"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body


def test_create_address() -> None:
    response = client.post(
        "/api/v1/user/addresses",
        json={
            "label": "Nha",
            "recipient_name": "Nguyen Van A",
            "recipient_phone": "0900000000",
            "street": "123 Tran Hung Dao",
            "district": "Quan 1",
            "city": "Ho Chi Minh",
            "is_default": True,
        },
    )
    assert response.status_code == 201
    assert response.json()["address_id"] >= 1


def test_list_workshops() -> None:
    response = client.get("/api/v1/workshops")
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_tracking_lookup() -> None:
    response = client.get("/api/v1/tracking/THO-2024-0847")
    assert response.status_code == 200
    assert response.json()["tracking_type"] == "ceramic"


def test_create_review() -> None:
    response = client.post(
        "/api/v1/reviews",
        json={
            "name": "Nguyen Van A",
            "title": "Trai nghiem tot",
            "comment": "Workshop am cung va de theo doi don hang.",
            "rating": 5,
        },
    )
    assert response.status_code == 201
    assert response.json()["review_id"] >= 1
