from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import exercise, equipment, muscle
import os
load_dotenv()

os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

app = FastAPI(title = "Welocome to BIOfitIQ Backend", version = "1.0.0")

origins = [
    "https://bio-fit-iq.vercel.app",
    "https://biofitiq.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # use explicit origins; avoid '*' in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(exercise.router)
app.include_router(equipment.router)
app.include_router(muscle.router)

@app.get("/")
def root_head():
    return ({"message" : "Welcome to Home route"})
