"""
AI Analyzer Module
Uses OpenAI GPT to generate SEO reports, content strategies,
competitor gap analysis, and social media post drafts.
"""

import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

MODEL = "gpt-4o-mini"


def _call_gpt(system_prompt: str, user_prompt: str) -> str:
    """Generic GPT caller with error handling."""
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=2500,
        )
        return response.choices[0].message.content
    except Exception as e:
        return json.dumps({"error": str(e)})


def generate_seo_report(scraped_data: dict) -> dict:
    """
    Analyze scraped website data and produce a structured SEO audit report.
    """
    system_prompt = (
        "You are an expert SEO consultant. Analyze the provided website data and return a JSON object "
        "with the following keys: "
        '"overall_score" (0-100), '
        '"summary" (2-3 sentence overview), '
        '"title_analysis" (object with score, current_title, recommendation), '
        '"meta_description_analysis" (object with score, current, recommendation), '
        '"heading_structure" (object with score, issues list, recommendation), '
        '"content_quality" (object with score, word_count_assessment, recommendation), '
        '"image_optimization" (object with score, total_images, missing_alt, recommendation), '
        '"link_profile" (object with score, internal_count, external_count, recommendation), '
        '"technical_seo" (object with score, issues list), '
        '"top_priorities" (list of top 5 action items sorted by impact). '
        "Respond ONLY with valid JSON, no markdown fences."
    )

    user_prompt = f"""Analyze this website data:
URL: {scraped_data.get('url', '')}
Title: {scraped_data.get('title', '')}
Meta Description: {scraped_data.get('meta_description', '')}
Meta Keywords: {scraped_data.get('meta_keywords', '')}
Word Count: {scraped_data.get('word_count', 0)}
Headings: {json.dumps(scraped_data.get('headings', {}))}
Total Images: {scraped_data.get('total_images', 0)}
Images Without Alt: {scraped_data.get('images_without_alt', 0)}
Internal Links: {scraped_data.get('internal_link_count', 0)}
External Links: {scraped_data.get('external_link_count', 0)}
Has JSON-LD: {scraped_data.get('has_json_ld', False)}
Script Count: {scraped_data.get('script_count', 0)}
Stylesheet Count: {scraped_data.get('stylesheet_count', 0)}
OG Tags: {json.dumps(scraped_data.get('og_tags', {}))}
Body Text Preview: {scraped_data.get('body_text_preview', '')[:1500]}"""

    raw = _call_gpt(system_prompt, user_prompt)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"raw_response": raw, "parse_error": True}


def generate_content_strategy(scraped_data: dict) -> dict:
    """
    Generate a content marketing strategy based on the website's niche and current content.
    """
    system_prompt = (
        "You are a content marketing strategist for local businesses. "
        "Based on the website data, return a JSON object with: "
        '"business_type" (inferred type), '
        '"target_audience" (description), '
        '"content_pillars" (list of 4-5 content topic pillars), '
        '"blog_ideas" (list of 8 blog post ideas with title and brief description), '
        '"local_seo_tips" (list of 5 local-SEO-specific recommendations), '
        '"content_calendar" (list of 4 weekly themes). '
        "Respond ONLY with valid JSON, no markdown fences."
    )

    user_prompt = f"""Website: {scraped_data.get('url', '')}
Title: {scraped_data.get('title', '')}
Description: {scraped_data.get('meta_description', '')}
Content Preview: {scraped_data.get('body_text_preview', '')[:1500]}
Headings H1: {json.dumps(scraped_data.get('headings', {}).get('h1', []))}
Headings H2: {json.dumps(scraped_data.get('headings', {}).get('h2', []))}"""

    raw = _call_gpt(system_prompt, user_prompt)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"raw_response": raw, "parse_error": True}


def generate_social_media_posts(scraped_data: dict) -> dict:
    """
    Auto-generate social media post drafts based on the business's profile.
    """
    system_prompt = (
        "You are a social media expert for local businesses. "
        "Based on the website data, generate a JSON object with: "
        '"platform_recommendations" (list of best platforms with reason), '
        '"posts" (list of 6 post objects, each with: platform, content, hashtags, '
        "best_time_to_post, post_type). "
        "Make posts engaging, local, and shareable. "
        "Respond ONLY with valid JSON, no markdown fences."
    )

    user_prompt = f"""Business Website: {scraped_data.get('url', '')}
Title: {scraped_data.get('title', '')}
Description: {scraped_data.get('meta_description', '')}
Content: {scraped_data.get('body_text_preview', '')[:1000]}"""

    raw = _call_gpt(system_prompt, user_prompt)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"raw_response": raw, "parse_error": True}


def generate_competitor_analysis(scraped_data: dict, competitor_names: list) -> dict:
    """
    Perform a gap analysis comparing the business to its local competitors.
    """
    system_prompt = (
        "You are a competitive analysis expert. Compare the given business "
        "to its competitors and return a JSON object with: "
        '"business_name" (the analyzed business), '
        '"competitors" (list of competitor objects with name, strengths, weaknesses), '
        '"gap_analysis" (list of opportunities the business is missing), '
        '"action_plan" (list of 5 prioritized actions to outperform competitors), '
        '"competitive_advantages" (list of current advantages). '
        "Respond ONLY with valid JSON, no markdown fences."
    )

    user_prompt = f"""Analyzed Business Website: {scraped_data.get('url', '')}
Business Title: {scraped_data.get('title', '')}
Business Description: {scraped_data.get('meta_description', '')}
Business Content: {scraped_data.get('body_text_preview', '')[:800]}

Nearby Competitors: {json.dumps(competitor_names)}"""

    raw = _call_gpt(system_prompt, user_prompt)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"raw_response": raw, "parse_error": True}
