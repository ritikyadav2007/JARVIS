# JARVIS - Personal AI Assistant for macOS

JARVIS is a modular personal AI desktop assistant designed for macOS, starting with a clean React + TypeScript frontend and a Python FastAPI backend.

---

## Project Structure

```text
Jarvis/
├── .gitignore          # Keeps secrets and dependencies from being committed
├── README.md           # Project documentation and guide
├── frontend/           # React + TypeScript + Vite UI dashboard
└── backend/            # Python FastAPI service
```

---

## Getting Started

### 1. Frontend Setup (React + Vite)
In a terminal, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the JARVIS dashboard.

### 2. Backend Setup (FastAPI)
In a second terminal window, navigate to the `backend` directory:
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```
The backend API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

