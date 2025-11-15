from fastapi import APIRouter, HTTPException
import requests
from LLM import llm
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser

router = APIRouter(tags=["Muscle"], prefix="/muscle")

strparser = StrOutputParser()
jsonparser = JsonOutputParser()


# ---------------- Agent 1: Summary Generator ---------------- #

def generate_muscle_summary(exercise_data: object):
    prompt = (
        "Summarize the following exercise data in 3–4 crisp sentences. "
        "Explain what these exercises target, primary muscles involved, and why they help.\n"
        f"{exercise_data}\nSummary:"
    )
    response = llm.llm.invoke(prompt)
    return strparser.parse(response.content)


# ---------------- Agent 2: JSON Converter ---------------- #

def convert_muscle_to_json(summary: str, original_data: object):
    prompt = f"""
    Return ONLY valid JSON. No markdown or explanations.

    Extract the BEST 5 exercises for the given muscle group.
    If fewer than 5 exist, add realistic exercises targeting the same muscle.

    Output Schema (exact keys):
    {{
      "muscle": "",
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
    - level must be: Beginner, Intermediate, Expert, or Professional.
    - Always output exactly 5 exercises.
    - Must include:
        1 Beginner exercise
        1 Intermediate exercise
        1 Expert exercise
        1 Professional exercise
        1 additional exercise (any level)
    - Sentences must be short and simple.
    - pros/cons/directions/form must be arrays of strings.
    - analogy must be a single mental cue (e.g., "imagine squeezing the muscle").
    - No missing or extra fields.

    Convert the data below into the schema:
    Summary: {summary}
    Original: {original_data}
    """
    response = llm.llm.invoke(prompt)
    return jsonparser.parse(response.content)


# ---------------- Endpoint: Get Exercises By Muscle ---------------- #

@router.get("/bymuscle/{muscle_name}")
def get_exercise_by_muscle(muscle_name: str, includeSecondary: bool = False,
                           offset: int = 0, limit: int = 10):

    data_by_muscle = requests.get(
        f"https://exercisedb-api.vercel.app/api/v1/muscles/{muscle_name}/exercises",
        params={
            "offset": offset,
            "limit": limit,
            "includeSecondary": includeSecondary
        }
    )

    if not data_by_muscle.ok:
        raise HTTPException(status_code=404, detail="Muscle not found")

    summary = generate_muscle_summary(data_by_muscle.json())
    structured = convert_muscle_to_json(summary, data_by_muscle.json())

    return {
        "summary": summary,
        "structured_data": structured
    }
