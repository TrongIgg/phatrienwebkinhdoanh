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


def test_create_tracking_record_and_lookup() -> None:
    response = client.post(
        "/api/v1/tracking",
        json={
            "records": [
                {
                    "code": "ORDTESTDB01",
                    "tracking_type": "order",
                    "status": "paid_waiting_pack",
                    "title": "Don hang test DB",
                    "message": "Da thanh toan va cho dong goi.",
                    "manager_name": "Chi Linh",
                    "timeline": [
                        {"stage": "paid", "label": "Da thanh toan", "state": "done"},
                        {"stage": "packing", "label": "Cho dong goi", "state": "current"},
                    ],
                }
            ]
        },
    )
    assert response.status_code == 201

    lookup = client.get("/api/v1/tracking/ORDTESTDB01")
    assert lookup.status_code == 200
    body = lookup.json()
    assert body["title"] == "Don hang test DB"
    assert body["timeline"][1]["stage"] == "packing"


def test_staff_sync_endpoints() -> None:
    bookings = client.get("/api/v1/staff/bookings")
    assert bookings.status_code == 200
    assert len(bookings.json()) >= 1

    trackers = client.get("/api/v1/staff/trackers")
    assert trackers.status_code == 200
    body = trackers.json()
    assert any(item.get("tracking_code") == "THO-2024-0847" for item in body)

    dashboard = client.get("/api/v1/staff/dashboard")
    assert dashboard.status_code == 200
    assert dashboard.json()["week"] >= 1


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
