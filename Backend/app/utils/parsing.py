
import json

def _safe_json(text: str):
    t = text.strip()
    # handle `````` or ``````
    if t.startswith("```") and t.endswith("```"):
        t = t.strip("`").strip()
        # drop 'json' language hint if present
        if t.lower().startswith("json"):
            t = t[4:].strip()
    return json.loads(t)
