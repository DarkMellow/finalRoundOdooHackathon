# EasyRental Backend API

FastAPI backend service for the **EasyRental** project, connected to a local MySQL / MariaDB database (`easy-rental`).

## Database Configuration

- **Database Engine:** MySQL / MariaDB
- **Database Name:** `easy-rental`
- **User:** `root`
- **Password:** `32`
- **Host:** `localhost:3306`

## Setup & Execution

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables:**
   The connection URL is stored in `.env`:
   ```env
   DB_USER=root
   DB_PASSWORD=32
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=easy-rental
   DATABASE_URL=mysql+pymysql://root:32@localhost:3306/easy-rental
   ```

3. **Start FastAPI Server:**
   ```bash
   uvicorn main:app --reload
   ```

4. **Verify Health & Database Connection:**
   - App API: `http://127.0.0.1:8000`
   - Database Status: `http://127.0.0.1:8000/db-status`
   - Interactive Swagger Docs: `http://127.0.0.1:8000/docs`
