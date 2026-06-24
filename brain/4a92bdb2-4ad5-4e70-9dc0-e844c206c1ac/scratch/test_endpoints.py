print("STARTING TEST SCRIPT", flush=True)

import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    # 1. Test Health
    try:
        print("Testing health...", flush=True)
        res = requests.get(f"{BASE_URL}/health", timeout=5)
        print("Health status:", res.status_code, res.json(), flush=True)
    except Exception as e:
        print("Health failed to connect:", e, flush=True)
        sys.exit(1)

    # 2. Test Signup with unique random email
    import random
    rand_id = random.randint(1000, 9999)
    test_email = f"testuser{rand_id}@gmail.com"
    payload = {
        "name": "Test User",
        "email": test_email,
        "password": "mysecurepassword123",
        "phone": "+91 9876543210",
        "role": "student",
        "domain_id": "default"
    }

    try:
        print("Testing signup...", flush=True)
        res = requests.post(f"{BASE_URL}/signup", json=payload, timeout=5)
        print("Signup response:", res.status_code, res.json(), flush=True)
        if res.status_code != 200:
            print("Signup failed!", flush=True)
            sys.exit(1)
    except Exception as e:
        print("Signup failed to connect:", e, flush=True)
        sys.exit(1)

    # 3. Test Signup duplicate check (should return 400 User already exists)
    try:
        print("Testing duplicate signup...", flush=True)
        res = requests.post(f"{BASE_URL}/signup", json=payload, timeout=5)
        print("Duplicate signup response (expected 400):", res.status_code, res.json(), flush=True)
        if res.status_code != 400:
            print("Duplicate signup check failed!", flush=True)
            sys.exit(1)
    except Exception as e:
        print("Duplicate signup failed to connect:", e, flush=True)
        sys.exit(1)

    # 4. Test Signin with cookie check
    login_payload = {
        "email": test_email,
        "password": "mysecurepassword123",
        "role": "student"
    }
    try:
        print("Testing signin...", flush=True)
        session = requests.Session()
        res = session.post(f"{BASE_URL}/signin", json=login_payload, timeout=5)
        print("Signin response:", res.status_code, res.json(), flush=True)
        print("Cookies returned:", session.cookies.get_dict(), flush=True)
        
        # Check /me endpoint using the session (cookie-auth)
        print("Testing /me verification...", flush=True)
        res_me = session.get(f"{BASE_URL}/me", timeout=5)
        print("Get Me response:", res_me.status_code, res_me.json(), flush=True)
        if res_me.status_code != 200:
            print("Session verification failed!", flush=True)
            sys.exit(1)
    except Exception as e:
        print("Signin failed to connect:", e, flush=True)
        sys.exit(1)

    print("\nALL BACKEND AUTH TESTS PASSED SUCCESSFULLY!", flush=True)

if __name__ == "__main__":
    run_tests()
