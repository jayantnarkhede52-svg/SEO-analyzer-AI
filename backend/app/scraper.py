"""
Web Scraper Module
Extracts metadata, headings, content, images, and links from a business website.
"""

import requests
import urllib3
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import Optional

# Suppress SSL warnings for environments without root certificates
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def scrape_website(url: str) -> dict:
    """
    Scrape a business website and extract structured data for analysis.
    Returns a dict with title, meta_description, headings, paragraphs, images, links, etc.
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }

    try:
        response = requests.get(url, headers=headers, timeout=15, verify=False)
        response.raise_for_status()
    except requests.RequestException as e:
        return {"error": str(e), "success": False}

    soup = BeautifulSoup(response.text, "lxml")
    parsed_url = urlparse(url)
    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"

    # --- Title ---
    title = soup.title.string.strip() if soup.title and soup.title.string else ""

    # --- Meta Description ---
    meta_desc_tag = soup.find("meta", attrs={"name": "description"})
    meta_description = meta_desc_tag["content"].strip() if meta_desc_tag and meta_desc_tag.get("content") else ""

    # --- Meta Keywords ---
    meta_kw_tag = soup.find("meta", attrs={"name": "keywords"})
    meta_keywords = meta_kw_tag["content"].strip() if meta_kw_tag and meta_kw_tag.get("content") else ""

    # --- Open Graph ---
    og_tags = {}
    for og in soup.find_all("meta", attrs={"property": lambda x: x and x.startswith("og:")}):
        og_tags[og["property"]] = og.get("content", "")

    # --- Headings ---
    headings = {}
    for level in range(1, 7):
        tag = f"h{level}"
        headings[tag] = [h.get_text(strip=True) for h in soup.find_all(tag)]

    # --- Paragraphs (body text) ---
    paragraphs = [p.get_text(strip=True) for p in soup.find_all("p") if p.get_text(strip=True)]

    # --- Images ---
    images = []
    for img in soup.find_all("img"):
        src = img.get("src", "")
        alt = img.get("alt", "")
        if src:
            images.append({
                "src": urljoin(base_url, src),
                "alt": alt,
                "has_alt": bool(alt.strip()),
            })

    # --- Internal & External Links & Leads ---
    internal_links = set()
    external_links = set()
    emails = set()
    phones = set()
    social_links = set()
    social_domains = ['facebook.com', 'instagram.com', 'linkedin.com', 'twitter.com', 'x.com', 'youtube.com', 'yelp.com', 'indiamart.com', 'justdial.com']

    for a in soup.find_all("a", href=True):
        href = a["href"]
        try:
            # Extract emails
            if href.startswith("mailto:"):
                email = href.replace("mailto:", "").split("?")[0].strip()
                if email: emails.add(email)
                continue
            
            # Extract phones
            if href.startswith("tel:") or href.startswith("whatsapp://send"):
                phone = href.replace("tel:", "").replace("whatsapp://send?phone=", "").split("&")[0].strip()
                if phone: phones.add(phone)
                continue
                
            full_url = urljoin(base_url, href)
            link_parsed = urlparse(full_url)
            
            if link_parsed.scheme not in ("http", "https"):
                continue

            if link_parsed.netloc == parsed_url.netloc:
                internal_links.add(full_url)
            else:
                external_links.add(full_url)
                # Check for social links
                if any(sd in link_parsed.netloc for sd in social_domains):
                    social_links.add(full_url)
        except Exception:
            pass # Ignore malformed links

    # --- Page load performance hints ---
    scripts = soup.find_all("script", src=True)
    stylesheets = soup.find_all("link", rel="stylesheet")
    
    # Estimate raw HTML size in KB
    html_size_kb = len(response.text) / 1024
    
    # Check mobile responsiveness tag
    viewport_meta = soup.find("meta", attrs={"name": "viewport"})
    has_viewport = bool(viewport_meta and "width=device-width" in viewport_meta.get("content", ""))

    # --- Structured Data (JSON-LD) ---
    json_ld = []
    for script in soup.find_all("script", type="application/ld+json"):
        json_ld.append(script.string)

    # --- Word Count ---
    body_text = soup.body.get_text(separator=" ", strip=True) if soup.body else ""
    word_count = len(body_text.split())

    return {
        "success": True,
        "url": url,
        "title": title,
        "meta_description": meta_description,
        "meta_keywords": meta_keywords,
        "og_tags": og_tags,
        "headings": headings,
        "paragraphs": paragraphs[:30],  # cap to avoid huge payloads
        "images": images,
        "images_without_alt": sum(1 for img in images if not img["has_alt"]),
        "total_images": len(images),
        "internal_links": list(internal_links)[:50],
        "external_links": list(external_links)[:50],
        "internal_link_count": len(internal_links),
        "external_link_count": len(external_links),
        "script_count": len(scripts),
        "stylesheet_count": len(stylesheets),
        "has_json_ld": len(json_ld) > 0,
        "json_ld_snippets": json_ld,
        "word_count": word_count,
        "body_text_preview": body_text[:2000],
        
        # New v4 Features Data
        "emails": list(emails),
        "phones": list(phones),
        "social_links": list(social_links),
        "has_viewport_meta": has_viewport,
        "html_size_kb": round(html_size_kb, 2)
    }
