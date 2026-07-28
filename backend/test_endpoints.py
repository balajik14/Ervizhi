import requests

def test():

    print("Testing /ml/snap-solve...")
    res2 = requests.post("http://127.0.0.1:8000/api/ml/snap-solve", json={"image_base64": "fakeimage"})
    print("Snap Solve:", res2.status_code, res2.text[:100])

    print("Testing /ml/fertilizer-guide...")
    res3 = requests.post("http://127.0.0.1:8000/api/ml/fertilizer-guide", json={"crop_name": "Paddy", "land_size_acres": 2.0, "mode": "chemical"})
    print("Fertilizer:", res3.status_code, res3.text[:100])

test()
