import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_endpoints():
    print("Testing /ml/snap-solve...")
    res2 = client.post("/api/ml/snap-solve", json={"image_base64": "fakeimage"})
    assert res2.status_code == 200
    print("Snap Solve:", res2.status_code, res2.text[:100])

    print("Testing /ml/fertilizer-guide...")
    res3 = client.post("/api/ml/fertilizer-guide", json={"crop_name": "Paddy", "land_size_acres": 2.0, "mode": "chemical"})
    assert res3.status_code == 200
    print("Fertilizer:", res3.status_code, res3.text[:100])
