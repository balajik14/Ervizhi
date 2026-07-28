# Ervizhi Backend

This is the FastAPI backend for the Ervizhi Agritech application.

## Setup Instructions

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Database Configuration:**
   - Make sure you have PostgreSQL installed and running.
   - Update the `DATABASE_URL` in `.env` if your username/password/dbname is different.
   - Ensure the database `ervizhi` exists (`CREATE DATABASE ervizhi;` in psql).

5. **Initialize Alembic & Run Migrations:**
   ```bash
   # Initialize alembic (only if the alembic folder doesn't exist yet)
   alembic init alembic

   # Important: In alembic/env.py, import your Base and set target_metadata:
   # from app.models.user import Base # Make sure all models are imported before Base!
   # target_metadata = Base.metadata

   # Also in alembic/env.py, update the sqlalchemy.url to use the config:
   # from app.core.config import settings
   # config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

   # Create initial migration
   alembic revision --autogenerate -m "Initial migration"

   # Apply migration to database
   alembic upgrade head
   ```
   *(Note: The `models` are already defined with SQLAlchemy Base)*

6. **Start the FastAPI Server:**
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000`. 
API Documentation (Swagger UI) is automatically available at `http://localhost:8000/docs`.
