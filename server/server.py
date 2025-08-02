import os
import hashlib
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr, constr 
from supabase import create_client, Client
import requests

SUPABASE_URL = "https://jzufaedxpawkaggwonkr.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6dWZhZWR4cGF3a2FnZ3dvbmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMDg0NjcsImV4cCI6MjA2OTY4NDQ2N30.6fm0tMyRk8yx68h40zgY0usu7QDNtIgcyz-nQBMTQhI"

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    response = supabase.table('users').select('*').limit(1).execute()
    print("Connection successful!")
except Exception as e:
    print(f"Error connecting to Supabase: {e}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# ----------------------- Models -----------------------
class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class UserRegistration(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    phone: str = Field(..., pattern=r'^(?:\+91|0)?[6-9]\d{9}$')
    password: str = Field(..., min_length=6)

class Coordinate(BaseModel):
    latitude: float
    longitude: float

class ReportCreate(BaseModel):
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    category: constr(min_length=3)
    description: constr(min_length=3)
    latitude: float
    longitude: float
    evidence_files: Optional[list[str]] = Field(default=[])

# ----------------------- Helpers -----------------------
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(stored_password: str, provided_password: str) -> bool:
    return hashlib.sha256(provided_password.encode()).hexdigest() == stored_password

def supabase_post(table: str, data: dict):
    """Direct POST to Supabase REST API (bypasses SDK bugs)."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    resp = requests.post(url, headers=headers, json=data)
    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json() if resp.text else {}

# ----------------------- Routes -----------------------
@app.get("/")
async def root_route():
    return {"message": "Server running", "status": "ok"}

@app.post("/api/signup")
async def register_client(user_data: UserRegistration):
    try:
        # Check if user exists
        existing_user = supabase.table('users').select('username').eq('username', user_data.username).execute()
        if existing_user.data:
            raise HTTPException(status_code=400, detail="Username already exists")

        hashed_password = hash_password(user_data.password)
        payload = {
            'username': user_data.username,
            'email': user_data.email,
            'phone': user_data.phone,
            'password': hashed_password
        }
        supabase_post("users", payload)
        return {"message": "User registered successfully", "username": user_data.username}
    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@app.post("/api/signin")
async def login_user(user_data: UserLogin):
    try:
        user_response = supabase.table('users').select('*').eq('username', user_data.username).execute()
        if not user_response.data:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        user = user_response.data[0]
        if verify_password(user['password'], user_data.password):
            return {
                "message": "Login successful",
                "user_id": user.get('id'),
                "username": user['username']
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid username or password")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@app.post("/api/normal-report")
async def create_report(report: ReportCreate):
    try:
        payload = {
            "user_id": report.user_id,
            "user_name": report.user_name,
            "category": report.category,
            "description": report.description,
            "latitude": report.latitude,
            "longitude": report.longitude,
            "evidence_files": report.evidence_files
        }
        supabase_post("reports", payload)
        return {"message": "Report created successfully"}
    except HTTPException as http_error:
        raise http_error
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

@app.get("/heatmap/coordinates", response_model=list[Coordinate])
async def get_heatmap_coordinates():
    try:
        response = supabase.table('crime_report').select('latitude, longitude').execute()
        data = response.data
        return [
            {"latitude": row["latitude"], "longitude": row["longitude"]}
            for row in data if row["latitude"] is not None and row["longitude"] is not None
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")