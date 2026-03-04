"""
Competitors Module
Uses Google Maps Places API to discover nearby competing businesses.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
PLACES_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
PLACES_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"


def find_competitors(business_type: str, location: str, limit: int = 5) -> list:
    """
    Search Google Maps for competing businesses of the same type near the given location.
    Returns a list of competitor info dicts.
    """
    if not GOOGLE_MAPS_API_KEY or GOOGLE_MAPS_API_KEY == "your_google_maps_api_key_here":
        # Return mock data when no API key is configured
        return _get_mock_competitors(business_type, location)

    query = f"{business_type} near {location}"
    params = {
        "query": query,
        "key": GOOGLE_MAPS_API_KEY,
    }

    try:
        response = requests.get(PLACES_SEARCH_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        competitors = []
        for result in data.get("results", [])[:limit]:
            competitors.append({
                "name": result.get("name", ""),
                "address": result.get("formatted_address", ""),
                "rating": result.get("rating", 0),
                "total_ratings": result.get("user_ratings_total", 0),
                "place_id": result.get("place_id", ""),
                "business_status": result.get("business_status", ""),
                "types": result.get("types", []),
            })
        return competitors

    except requests.RequestException as e:
        return [{"error": str(e)}]


def _get_mock_competitors(business_type: str, location: str) -> list:
    """
    Returns realistic mock competitor data for demo/development purposes.
    """
    return [
        {
            "name": f"Premier {business_type.title()} Co.",
            "address": f"123 Main St, {location}",
            "rating": 4.5,
            "total_ratings": 287,
            "place_id": "mock_001",
            "business_status": "OPERATIONAL",
            "types": [business_type.lower().replace(" ", "_")],
        },
        {
            "name": f"{location} {business_type.title()} Hub",
            "address": f"456 Oak Ave, {location}",
            "rating": 4.2,
            "total_ratings": 153,
            "place_id": "mock_002",
            "business_status": "OPERATIONAL",
            "types": [business_type.lower().replace(" ", "_")],
        },
        {
            "name": f"Elite {business_type.title()} Services",
            "address": f"789 Pine Rd, {location}",
            "rating": 4.7,
            "total_ratings": 412,
            "place_id": "mock_003",
            "business_status": "OPERATIONAL",
            "types": [business_type.lower().replace(" ", "_")],
        },
        {
            "name": f"Budget {business_type.title()} Plus",
            "address": f"321 Elm Blvd, {location}",
            "rating": 3.9,
            "total_ratings": 98,
            "place_id": "mock_004",
            "business_status": "OPERATIONAL",
            "types": [business_type.lower().replace(" ", "_")],
        },
        {
            "name": f"Trusted {business_type.title()} Experts",
            "address": f"654 Maple Dr, {location}",
            "rating": 4.4,
            "total_ratings": 201,
            "place_id": "mock_005",
            "business_status": "OPERATIONAL",
            "types": [business_type.lower().replace(" ", "_")],
        },
    ]
