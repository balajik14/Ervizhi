import sys
import os
sys.path.append('d:/Ervizhi/backend')
import main
from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()
print("Total users:", len(users))
for u in users:
    print(u.username, u.email)
