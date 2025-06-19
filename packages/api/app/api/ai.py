from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
import httpx
import os
from openai import OpenAI
from app.core.security import get_current_active_user
from app.models.user import User
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


router = APIRouter()


class DrugInteractionRequest(BaseModel):
    medications: List[str]


class DrugInteractionResponse(BaseModel):
    interactions: List[str]
    summary: str


async def fetch_rxnav_interactions(drug_name: str) -> List[str]:
    """Fetch drug interactions from RxNav API"""
    try:
        async with httpx.AsyncClient() as client:
            # Get RxCUI for drug name
            response = await client.get(
                f"https://rxnav.nlm.nih.gov/REST/rxcui.json?name={drug_name}"
            )
            data = response.json()
            
            if not data.get("idGroup", {}).get("rxnormId"):
                return []
            
            rxcui = data["idGroup"]["rxnormId"][0]
            
            # Get interactions for RxCUI
            interactions_response = await client.get(
                f"https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui={rxcui}"
            )
            interactions_data = interactions_response.json()
            
            interactions = []
            interaction_groups = interactions_data.get("interactionTypeGroup", [])
            for group in interaction_groups:
                for interaction_type in group.get("interactionType", []):
                    for pair in interaction_type.get("interactionPair", []):
                        interacting_drug = pair.get("interactionConcept", [{}])[1].get("minConceptItem", {}).get("name", "")
                        if interacting_drug:
                            interactions.append(interacting_drug)
            
            return interactions
    except Exception as e:
        print(f"Error fetching RxNav data for {drug_name}: {e}")
        return []


@router.post("/check-interactions", response_model=DrugInteractionResponse)
async def check_interactions(
    request: DrugInteractionRequest,
    current_user: User = Depends(get_current_active_user),
):
    if len(request.medications) < 2:
        return DrugInteractionResponse(
            interactions=[],
            summary="At least two medications are required to check for interactions."
        )
    
    # Fetch interactions from RxNav
    all_interactions = set()
    interaction_pairs = []
    
    for i, drug1 in enumerate(request.medications):
        rxnav_interactions = await fetch_rxnav_interactions(drug1)
        for drug2 in request.medications[i+1:]:
            if drug2.lower() in [interaction.lower() for interaction in rxnav_interactions]:
                interaction_pairs.append(f"{drug1} and {drug2}")
    
    # Use OpenAI to generate a summary if API key is available
    openai_api_key = os.getenv("OPENAI_API_KEY")
    
    if openai_api_key:
        try:
            client = OpenAI(api_key=openai_api_key)
            
            prompt = f"""You are a clinical pharmacist. Analyze the following medications for potential interactions. Your summary will be shared with both healthcare professionals and patients, so it should be informative, accurate, and easy to understand.

Medications: {', '.join(request.medications)}
{f'Known interactions from RxNav: {', '.join(interaction_pairs)}' if interaction_pairs else ''}

Please provide:
1. A clear explanation of any significant drug interactions, using simple language for patients but including clinical details for doctors.
2. The severity of any interactions (if any), and what symptoms or side effects to watch for.
3. Practical advice for both patients and clinicians (e.g., when to seek help, possible alternatives, or monitoring tips).

Keep the summary concise, friendly, and actionable. Avoid medical jargon where possible, and explain any necessary terms."""

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a clinical pharmacist providing drug interaction analysis."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.3
            )
            
            summary = response.choices[0].message.content.strip()
            
            return DrugInteractionResponse(
                interactions=interaction_pairs,
                summary=summary
            )
        except Exception as e:
            print(f"OpenAI API error: {e}")
            # Fall back to basic summary
    
    # Basic summary without AI
    if interaction_pairs:
        summary = f"Potential interactions detected between: {', '.join(interaction_pairs)}. Please review these combinations carefully and consider alternative medications if necessary."
    else:
        summary = f"No significant interactions detected between the {len(request.medications)} medications. However, always consider patient-specific factors and monitor for adverse effects."
    
    return DrugInteractionResponse(
        interactions=interaction_pairs,
        summary=summary
    )