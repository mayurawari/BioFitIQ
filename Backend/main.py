from fastapi import FastAPI
from dotenv import load_dotenv
from routes import exercise, equipment, muscle
import os
load_dotenv()

os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

app = FastAPI(title = "Welocome to BIOfitIQ Backend", version = "1.0.0")
app.include_router(exercise.router)
app.include_router(equipment.router)
app.include_router(muscle.router)

@app.get("/")
def root_head():
    return ({"message" : "Welcome to Home route"})