"""
Local SEO Scoring Engine — Truly Free v3
Produces a full SEO audit report without requiring any external AI API.
Includes Keyword Density Analysis and Natural Language Extraction.
"""

import re
from urllib.parse import urlparse
from collections import Counter

def _clamp(val, lo=0, hi=100):
    return max(lo, min(hi, int(val)))

def _get_stop_words():
    return {
        "the", "and", "for", "your", "that", "this", "with", "from", "have", "been", 
        "will", "more", "about", "some", "best", "home", "page", "contact", "service",
        "our", "all", "what", "who", "when", "where", "how", "has", "are", "was", "were"
    }

def analyze_keyword_density(text: str, top_n: int = 15) -> list:
    """
    Calculate keyword density (real info) from page content.
    Returns a list of dicts with word, count, and density percentage.
    """
    if not text:
        return []
        
    # Clean and tokenize
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    total_count = len(words)
    if total_count == 0:
        return []
        
    stop_words = _get_stop_words()
    filtered_words = [w for w in words if w not in stop_words]
    
    counts = Counter(filtered_words)
    common = counts.most_common(top_n)
    
    density_report = []
    for word, count in common:
        density = (count / total_count) * 100
        density_report.append({
            "keyword": word,
            "count": count,
            "density": round(density, 2),
            "status": "High" if density > 3 else "Ideal" if density >= 1 else "Low"
        })
        
    return density_report

def _score_title(scraped: dict) -> dict:
    title = scraped.get("title", "")
    length = len(title)
    score = 100
    issues = []
    rec = ""

    if not title:
        score = 0
        issues.append("Page has no title tag")
        rec = "Add a descriptive <title> tag between 50-60 characters."
    elif length < 30:
        score = 50
        issues.append(f"Title is too short ({length} chars)")
        rec = "Expand your title to 50-60 characters with relevant keywords."
    elif length > 70:
        score = 60
        issues.append(f"Title is too long ({length} chars) — may be truncated in search results")
        rec = "Shorten your title to 50-60 characters."
    else:
        rec = "Title length is within the ideal range."

    return {
        "score": _clamp(score),
        "current_title": title,
        "length": length,
        "ideal_range": "50-60 characters",
        "issues": issues,
        "recommendation": rec,
    }

def _score_meta_description(scraped: dict) -> dict:
    desc = scraped.get("meta_description", "")
    length = len(desc)
    score = 100
    issues = []
    rec = ""

    if not desc:
        score = 0
        issues.append("Missing meta description")
        rec = "Add a compelling meta description of 150-160 characters."
    elif length < 120:
        score = 55
        issues.append(f"Meta description is too short ({length} chars)")
        rec = "Expand your meta description to 150-160 characters."
    elif length > 165:
        score = 65
        issues.append(f"Meta description is too long ({length} chars)")
        rec = "Trim your meta description to 150-160 characters."
    else:
        rec = "Meta description length is ideal."

    return {
        "score": _clamp(score),
        "current": desc,
        "length": length,
        "ideal_range": "150-160 characters",
        "issues": issues,
        "recommendation": rec,
    }

def _score_headings(scraped: dict) -> dict:
    headings = scraped.get("headings", {})
    h1s = headings.get("h1", [])
    h2s = headings.get("h2", [])
    h3s = headings.get("h3", [])
    score = 100
    issues = []

    if len(h1s) == 0:
        score -= 40
        issues.append("No H1 tag found — every page needs exactly one H1")
    elif len(h1s) > 1:
        score -= 20
        issues.append(f"Multiple H1 tags found ({len(h1s)}) — use only one H1 per page")

    if len(h2s) == 0:
        score -= 20
        issues.append("No H2 tags found — use H2 tags to structure your content")

    total = sum(len(v) for v in headings.values())
    rec = f"Found {total} heading tags. " + (
        "Good heading structure." if not issues else "Fix the heading hierarchy for better SEO."
    )

    return {
        "score": _clamp(score),
        "h1_count": len(h1s),
        "h2_count": len(h2s),
        "h3_count": len(h3s),
        "total_headings": total,
        "h1_texts": h1s,
        "h2_texts": h2s,
        "h3_texts": h3s,
        "issues": issues,
        "recommendation": rec,
    }

def _score_content(scraped: dict) -> dict:
    wc = scraped.get("word_count", 0)
    score = 100
    issues = []

    if wc < 100:
        score = 20
        issues.append(f"Very thin content ({wc} words) — aim for 800+ words")
    elif wc < 300:
        score = 40
        issues.append(f"Content is thin ({wc} words) — aim for 800+ words for competitive SEO")
    elif wc < 600:
        score = 65
        issues.append(f"Content could be expanded ({wc} words)")
    elif wc > 2500:
        score = 90
        issues.append("Very long content — make sure it's well-structured and scannable")

    rec = f"{wc} words on page. " + (
        "Strong content volume." if wc >= 600 else "Add more quality content to rank better."
    )

    return {
        "score": _clamp(score),
        "word_count": wc,
        "assessment": "Excellent" if wc >= 800 else "Good" if wc >= 600 else "Needs improvement" if wc >= 300 else "Very thin",
        "issues": issues,
        "recommendation": rec,
    }

def _score_images(scraped: dict) -> dict:
    total = scraped.get("total_images", 0)
    missing_alt = scraped.get("images_without_alt", 0)
    score = 100
    issues = []

    if total == 0:
        score = 60
        issues.append("No images found — images improve engagement and SEO")
    else:
        if missing_alt > 0:
            pct = (missing_alt / total) * 100
            score -= int(pct * 0.5)
            issues.append(f"{missing_alt} of {total} images missing alt text ({pct:.0f}%)")

    rec = (
        f"{total} images found, {total - missing_alt} have alt text. "
        + ("All images are optimized!" if missing_alt == 0 and total > 0 else "Add descriptive alt text to all images.")
    )

    return {
        "score": _clamp(score),
        "total_images": total,
        "missing_alt": missing_alt,
        "with_alt": total - missing_alt,
        "issues": issues,
        "recommendation": rec,
    }

# --- v4 Premium Features ---

def analyze_readability(text: str) -> dict:
    """
    Calculates Flesch-Kincaid Grade Level and Reading Ease.
    """
    if not text or len(text.strip()) < 50:
        return {"score": 0, "grade_level": "N/A", "reading_ease": 0, "assessment": "Not enough text to analyze."}
        
    # Basic syllable estimation (not perfect, but fast & free)
    def count_syllables(word):
        word = word.lower()
        if len(word) <= 3: return 1
        word = re.sub(r'(?:[^laeiouy]|ed|[^laeiouy]e)$', '', word)
        word = re.sub(r'^y', '', word)
        matches = re.findall(r'[aeiouy]{1,2}', word)
        return max(1, len(matches))

    words = re.findall(r'\b\w+\b', text)
    sentences = re.split(r'[.!?]+', text)
    sentences = [s for s in sentences if s.strip()]
    
    word_count = len(words)
    sentence_count = len(sentences)
    if word_count == 0 or sentence_count == 0:
        return {"score": 0, "grade_level": "N/A", "reading_ease": 0, "assessment": "Not enough text to analyze."}
        
    syllable_count = sum(count_syllables(w) for w in words)
    
    # Flesch Reading Ease
    # 206.835 - 1.015(Total Words / Total Sentences) - 84.6(Total Syllables / Total Words)
    reading_ease = 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (syllable_count / word_count)
    reading_ease = _clamp(reading_ease)
    
    # Flesch-Kincaid Grade Level
    # 0.39(Total Words / Total Sentences) + 11.8(Total Syllables / Total Words) - 15.59
    grade_level = 0.39 * (word_count / sentence_count) + 11.8 * (syllable_count / word_count) - 15.59
    grade_level = max(1, round(grade_level, 1))

    if reading_ease >= 80: assessment = "Very Easy (Conversational)"
    elif reading_ease >= 60: assessment = "Easy to Read (Ideal for web)"
    elif reading_ease >= 40: assessment = "Fairly Difficult (High School)"
    else: assessment = "Difficult to Read (Academic/Technical)"

    issues = []
    if reading_ease < 60:
        issues.append(f"Content is too difficult to read (Score: {round(reading_ease, 1)}). Aim for 60+ by using shorter sentences and simpler words.")

    return {
        "score": reading_ease,
        "grade_level": f"Grade {grade_level}",
        "reading_ease": round(reading_ease, 1),
        "assessment": assessment,
        "issues": issues,
        "recommendation": "Aim for a Reading Ease around 60-70 for the best user engagement."
    }

def analyze_performance(scraped: dict) -> dict:
    """
    Estimates page performance and mobile readiness based on scraper payload.
    """
    score = 100
    issues = []
    
    # Size checks
    kb = scraped.get("html_size_kb", 0)
    img_count = scraped.get("total_images", 0)
    scripts = scraped.get("script_count", 0)
    
    if kb > 500:
        score -= 15
        issues.append(f"Heavy HTML Payload ({kb} KB). Minify your code.")
    if img_count > 20:
        score -= 10
        issues.append(f"High image count ({img_count}). Ensure they are compressed (WebP) and lazy-loaded.")
    if scripts > 15:
        score -= 10
        issues.append(f"High number of scripts ({scripts}). This can block rendering on mobile.")
        
    # Mobile checks
    if not scraped.get("has_viewport_meta", False):
        score -= 30
        issues.append("Missing Mobile Viewport Tag. The site may not be responsive on phones.")
        
    return {
        "score": _clamp(score),
        "html_size_kb": kb,
        "estimated_speed": "Fast" if score >= 90 else "Moderate" if score >= 70 else "Slow",
        "mobile_ready": scraped.get("has_viewport_meta", False),
        "issues": issues,
        "recommendation": "Compress images and reduce script payloads for faster mobile load times." if issues else "Performance indicators look healthy."
    }

def analyze_citations(scraped: dict) -> dict:
    """
    Checks if major local directory and social links are present on the website.
    """
    found_urls = scraped.get("social_links", [])
    found_domains = [urlparse(u).netloc for u in found_urls]
    
    key_platforms = {
        "facebook.com": "Facebook",
        "instagram.com": "Instagram",
        "linkedin.com": "LinkedIn",
        "twitter.com": "Twitter/X",
        "youtube.com": "YouTube",
        "indiamart.com": "IndiaMart",
        "justdial.com": "JustDial"
    }
    
    present = []
    missing = []
    
    for domain, name in key_platforms.items():
        if any(domain in fd for fd in found_domains):
            present.append(name)
        else:
            missing.append(name)
            
    score = 100
    if len(present) == 0:
        score = 20
    elif len(present) < 3:
        score = 60
        
    issues = []
    if missing:
        issues.append(f"Missing links to critical local directories: {', '.join(missing[:4])}.")
        if len(missing) > 4:
            issues.append(f"Also missing: {', '.join(missing[4:])}.")
        
    return {
        "score": score,
        "platforms_found": present,
        "platforms_missing": missing,
        "linked_urls": found_urls,
        "issues": issues,
        "recommendation": f"Add links to your {', '.join(missing[:3])} profiles to build local trust and citations." if missing else "Great job linking all major social and directory profiles!"
    }

def generate_local_seo_report(scraped: dict) -> dict:
    """
    Generate a complete SEO report with keyword density and v4 Features.
    """
    title_analysis = _score_title(scraped)
    meta_analysis = _score_meta_description(scraped)
    heading_analysis = _score_headings(scraped)
    content_analysis = _score_content(scraped)
    image_analysis = _score_images(scraped)
    
    # Keyword Density (Real Info)
    body_text = scraped.get("body_text_preview", "")
    keyword_density = analyze_keyword_density(body_text)
    
    # v4 Features
    readability = analyze_readability(body_text)
    performance = analyze_performance(scraped)
    citations = analyze_citations(scraped)

    # Simplified scoring
    scores = {
        "title": title_analysis["score"],
        "meta": meta_analysis["score"],
        "headings": heading_analysis["score"],
        "content": content_analysis["score"],
        "images": image_analysis["score"],
        "readability": readability["score"],
        "performance": performance["score"],
        "citations": citations["score"]
    }
    overall = sum(scores.values()) / len(scores)

    return {
        "overall_score": _clamp(int(overall)),
        "summary": "Full rule-based analysis complete.",
        "title_analysis": title_analysis,
        "meta_description_analysis": meta_analysis,
        "heading_structure": heading_analysis,
        "content_quality": content_analysis,
        "image_optimization": image_analysis,
        "keyword_density": keyword_density,
        # v4 Additions to the payload
        "readability_analysis": readability,
        "performance_audit": performance,
        "citation_check": citations,
        "extracted_leads": {
            "emails": scraped.get("emails", []),
            "phones": scraped.get("phones", [])
        },
        "section_scores": scores,
    }

def generate_local_content_strategy(scraped: dict) -> dict:
    """
    Generate strategy based on detected keywords.
    """
    density = analyze_keyword_density(scraped.get("body_text_preview", ""), top_n=5)
    keywords = [d["keyword"] for d in density]
    domain = urlparse(scraped.get("url", "")).netloc.replace("www.", "")

    h1s = scraped.get("headings", {}).get("h1", [])
    biz_type = h1s[0] if h1s else "Business"

    return {
        "business_type": biz_type,
        "target_audience": "Local customers needing services discovered via search.",
        "detected_keywords": density,
        "content_pillars": [f"Deep dive into {k}" for k in keywords] if keywords else ["Market Expertise"],
        "blog_ideas": [
            {"title": f"Why {k.title()} Matters for Your Business", "description": f"Understanding the role of {k} in the local market."}
            for k in keywords
        ][:5],
        "local_seo_tips": [
            "Optimize for local search by including your city name near these keywords.",
            "Build local Citations with consistent Name, Address, Phone.",
            "Gather real reviews from local customers."
        ]
    }

def generate_local_social_posts(scraped: dict) -> dict:
    """
    Basic social template.
    """
    h1s = scraped.get("headings", {}).get("h1", [])
    biz = h1s[0] if h1s else "Business Name"
    return {
        "platform_recommendations": ["Google Business Profile", "Instagram", "Facebook"],
        "posts": [
            {
                "platform": "Universal",
                "content": f"Hi everyone! {biz} is dedicated to serving you with quality and care. Check out our website for updates! 🚀",
                "hashtags": ["#LocalBusiness", "#GrowthPilot"],
                "best_time_to_post": "Tues-Thurs 10AM",
                "post_type": "Announcement"
            }
        ]
    }
