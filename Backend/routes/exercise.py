from fastapi import APIRouter, HTTPException
from LLM import llm
from langchain_core.output_parsers import StrOutputParser,JsonOutputParser 
import requests

router = APIRouter(tags = ["Excercise"], prefix = "/exercise")
strparser = StrOutputParser()
jsonparser = JsonOutputParser()


#  -- Agent-1 -- # 

def generate_excercise_summary(excercise_data: object):
    prompt = (
        "Summarize the following exercise data in 3–4 crisp sentences. "
        "Focus only on what the exercise is, muscles involved, and how it helps.\n"
        f"{excercise_data}\nSummary:"
    )
    
    response = llm.llm.invoke(prompt)
    
    summary = strparser.parse(response.content)
    
    # print(summary)
    
    return summary

#  -- Agent-2 -- # 

def generate_data_to_json(excercise_data : str, original_data: object):
    
    prompt = f"""
    Return ONLY valid JSON. No markdown or explanations.

    Extract the BEST 5 exercises for the body part.  
    If fewer than 5 exist, add realistic exercises for the same body part.
    
    Output Schema (exact keys):
    {{
    "bodyPart": "",
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
    - Strictly Keep exercises 1 for intermediate, 1 for expert, 1 for professional & 1 exercise of beginner level.
    - Use short, simple sentences.
    - pros/cons/directions/form must be arrays.
    - analogy must be a single mental cue (e.g., "imagine pushing the floor away").
    - No extra or missing fields.

    Convert the data below into the schema:
    Summary: {excercise_data}
    Original: {original_data}
    """


    
    response = llm.llm.invoke(prompt)
    
    
    
    json_data = jsonparser.parse(response.content)
    
    return json_data

@router.get("/bybodypart/{body_part}")
def get_excercises_by_body_part(body_part:str, offset: int = 0, limit: int = 10):
    data_by_part = requests.get(
        f"https://exercisedb-api.vercel.app/api/v1/bodyparts/{body_part}/exercises",
        params={
        "offset": offset,
        "limit": limit
        }
    )
    
    if not data_by_part.ok:
        raise HTTPException(status_code=404, detail="Body part not found")
    
    generated_summary = generate_excercise_summary(data_by_part.json())
    generated_json = generate_data_to_json(generated_summary, data_by_part.json())
    
    
    return {"summary": generated_summary, "structured_data": generated_json}


    
    