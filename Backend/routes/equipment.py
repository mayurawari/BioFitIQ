from fastapi import APIRouter, HTTPException
from LLM import llm
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
import requests

router = APIRouter(tags=["Equipment"], prefix="/equipment")

strparser = StrOutputParser()
jsonparser = JsonOutputParser()


# -------- Agent 1: Generate Summary -------- #

def generate_equipment_summary(exercise_data: object):
    prompt = (
        "Summarize the following exercise data in 3–4 crisp sentences. "
        "Explain what these exercises are, muscles involved, and how they help.\n"
        f"{exercise_data}\nSummary:"
    )
    response = llm.llm.invoke(prompt)
    return strparser.parse(response.content)


# -------- Agent 2: Convert Data to JSON Schema -------- #

def convert_equipment_to_json(summary: str, original_data: object):
    prompt = f"""
    Return ONLY valid JSON. No markdown or explanations.

    Extract the BEST 5 exercises for the equipment.  
    If fewer than 5 exist, add realistic exercises for the same equipment type.

    Output Schema (exact keys):
    {{
      "equipment": "",
      "exercises": [
        {{
          "name": "",
          "gifImage": "",
          "level": "",
          "pros": [],
          "cons": [],
          "directions": [],
          "form": [],
          "CommonMistakes": [],
          "Warnings":[#Don't do it if you have any of these conditions],
          "analogy": ""
        }}
      ]
    }}

    Rules:
    - level must be one of: Beginner, Intermediate, Expert, Professional.
    - Always output exactly 5 exercises.
    - Strictly include:
      - 1 Beginner exercise
      - 1 Intermediate exercise
      - 1 Expert exercise
      - 1 Professional exercise
      - 1 additional exercise of any level
    - Sentences must be short and simple.
    - pros/cons/directions/form must be arrays of strings.
    - analogy = a single mental cue (e.g., "imagine pushing the floor away").
    - No extra fields or missing fields.

    Convert the data below into the schema:
    Summary: {summary}
    Original: {original_data}
    """
    response = llm.llm.invoke(prompt)
    return jsonparser.parse(response.content)


# -------- Main Route: Get Exercises By Equipment -------- #

@router.get("/byequipment/{equipment_name}")
def get_exercise_by_equipment(equipment_name: str, offset: int = 0, limit: int = 10):

    data_by_equipment = requests.get(
        f"https://exercisedb-api.vercel.app/api/v1/equipments/{equipment_name}/exercises",
        params={"offset": offset, "limit": limit}
    )

    if not data_by_equipment.ok:
        raise HTTPException(status_code=404, detail="Equipment not found")

    # Run through agent 1 & 2
    summary = generate_equipment_summary(data_by_equipment.json())
    structured = convert_equipment_to_json(summary, data_by_equipment.json())

    return {
        "summary": summary,
        "structured_data": structured
    }
