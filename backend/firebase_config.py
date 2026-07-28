"""
Firebase Admin SDK Configuration Module
=========================================
Initializes Firebase App, Firestore, Auth, and Storage as singletons.
All backend Firebase operations should import from this module.

Usage:
    from firebase_config import db, storage_bucket, verify_token
"""

import os
import logging
from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("ervizhi.firebase")

# ---------------------------------------------------------------------------
# Singleton initialisation
# ---------------------------------------------------------------------------
_app: firebase_admin.App | None = None


def _init_firebase() -> firebase_admin.App:
    """Initialise Firebase Admin SDK exactly once."""
    global _app
    if _app is not None:
        return _app

    import json

    service_account_path = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_PATH", "firebase-service-account.json"
    )
    firebase_cred_json = os.getenv("FIREBASE_CREDENTIALS_JSON")

    if firebase_cred_json:
        try:
            cred_dict = json.loads(firebase_cred_json)
            cred = credentials.Certificate(cred_dict)
        except json.JSONDecodeError as e:
            logger.error("Failed to parse FIREBASE_CREDENTIALS_JSON: %s", e)
            raise
    else:
        if not os.path.exists(service_account_path):
            logger.warning(
                "Firebase service account file not found at '%s'. "
                "Firebase features will be unavailable.",
                service_account_path,
            )
            raise FileNotFoundError(
                f"Firebase service account JSON not found: {service_account_path}"
            )
        cred = credentials.Certificate(service_account_path)
    storage_bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET", "")

    _app = firebase_admin.initialize_app(
        cred,
        {
            "storageBucket": storage_bucket_name,
        },
    )
    logger.info("Firebase Admin SDK initialised successfully.")
    return _app


# ---------------------------------------------------------------------------
# Public helpers – lazily initialised
# ---------------------------------------------------------------------------

def get_firestore_client() -> firestore.firestore.Client:
    """Return the Firestore client (initialises Firebase if needed)."""
    _init_firebase()
    return firestore.client()


def get_storage_bucket() -> storage.storage.Bucket:
    """Return the default Storage bucket (initialises Firebase if needed)."""
    _init_firebase()
    return storage.bucket()


def verify_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return the decoded claims.

    Raises firebase_admin.auth.InvalidIdTokenError on failure.
    """
    _init_firebase()
    decoded = auth.verify_id_token(id_token)
    return decoded


def create_user(email: str, password: str, display_name: str | None = None) -> auth.UserRecord:
    """Create a new Firebase Auth user."""
    _init_firebase()
    kwargs: dict = {"email": email, "password": password}
    if display_name:
        kwargs["display_name"] = display_name
    return auth.create_user(**kwargs)


def get_user(uid: str) -> auth.UserRecord:
    """Get a Firebase Auth user by UID."""
    _init_firebase()
    return auth.get_user(uid)


def delete_user(uid: str) -> None:
    """Delete a Firebase Auth user."""
    _init_firebase()
    auth.delete_user(uid)


# ---------------------------------------------------------------------------
# Convenience aliases (import-friendly)
# ---------------------------------------------------------------------------

# These will raise on import if the service-account file is missing,
# which is fine – the server should fail-fast when Firebase is required.
try:
    db = get_firestore_client()
    storage_bucket = get_storage_bucket()
    logger.info("Firestore and Storage clients ready.")
except FileNotFoundError:
    db = None  # type: ignore[assignment]
    storage_bucket = None  # type: ignore[assignment]
    logger.warning(
        "Firebase not initialised – db and storage_bucket are None. "
        "Place your service-account JSON and restart."
    )
