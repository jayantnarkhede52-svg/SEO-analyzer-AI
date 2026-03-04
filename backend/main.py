"""
AI-Based Local Business Growth Engine — FastAPI Backend
Main entry point with all API routes.
Uses 100% FREE components:
- Local SEO Engine (NLP-based)
- OpenStreetMap (Competitor Discovery)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from app.scraper import scrape_website
from app.local_scorer import (
    generate_local_seo_report,
    generate_local_content_strategy,
    generate_local_social_posts,
)
from app.osm_competitors import find_competitors_osm

app = FastAPI(
    title="GrowthPilot v3 (Truly Free)",
    description="Truly free SEO, content, and competitive analysis for local businesses.",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    url: str
    business_type: Optional[str] = ""
    location: Optional[str] = ""

class HealthResponse(BaseModel):
    status: str
    version: str

@app.get("/", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="healthy", version="3.0.0")

@app.post("/api/analyze")
async def full_analysis(req: AnalyzeRequest):
    """
    Run a complete analysis using 100% free local and open-source engines.
    """
    # 1. Scrape
    scraped = scrape_website(req.url)
    if not scraped.get("success"):
        raise HTTPException(status_code=400, detail=scraped.get("error", "Failed to scrape website"))

    # 2. Generate reports via Local Engine (FREE)
    seo_report = generate_local_seo_report(scraped)
    content_strategy = generate_local_content_strategy(scraped)
    social_posts = generate_local_social_posts(scraped)

    # 3. Competitor Analysis via OpenStreetMap (FREE)
    competitor_data = None
    if req.business_type and req.location:
        competitors = find_competitors_osm(req.business_type, req.location)
        competitor_data = {
            "nearby_competitors": competitors,
            "source": "OpenStreetMap",
            "search_query": f"{req.business_type} in {req.location}"
        }

    return {
        "success": True,
        "url": req.url,
        "scraped_data": scraped,
        "scraped_summary": {
            "title": scraped.get("title"),
            "meta_description": scraped.get("meta_description"),
            "word_count": scraped.get("word_count"),
            "total_images": scraped.get("total_images"),
            "internal_link_count": scraped.get("internal_link_count"),
            "external_link_count": scraped.get("external_link_count"),
            "script_count": scraped.get("script_count"),
            "stylesheet_count": scraped.get("stylesheet_count"),
        },
        "seo_report": seo_report,
        "content_strategy": content_strategy,
        "social_media_posts": social_posts,
        "competitor_analysis": competitor_data,
        "engine": "GrowthPilot Free v3.0"
    }
