import os
import requests
from bs4 import BeautifulSoup
from transformers import pipeline
from dotenv import load_dotenv
import praw

# Load environment variables
load_dotenv()

# Reddit API setup
reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT")
)

# Summarizer
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# ✅ Claim detection using a public Hugging Face model
claim_det = pipeline(
    "text-classification",
    model="Nithiwat/xlm-roberta-base_claim-detection",
    return_all_scores=True
)

def is_claim(text):
    try:
        outputs = claim_det(text[:512])[0]
        for r in outputs:
            if r["label"].lower() == "claim" and r["score"] > 0.7:
                return True
    except Exception:
        pass
    return False

def fetch_comments(url, limit=10):
    submission = reddit.submission(url=url)
    submission.comments.replace_more(limit=0)
    bodies = [c.body for c in submission.comments[:limit]]
    # Filter only comments that are likely claims
    return [c for c in bodies if is_claim(c)]

def summarize_comment(text):
    if len(text.split()) < 30:
        return text
    summary = summarizer(text, max_length=80, min_length=20, do_sample=False)
    return summary[0]['summary_text']

def fact_check(query):
    serpapi_key = os.getenv("SERPAPI_KEY")
    params = {
        "q": query,
        "api_key": serpapi_key,
        "engine": "google",
        "num": 3
    }

    try:
        resp = requests.get("https://serpapi.com/search", params=params).json()
        results = resp.get("organic_results", [])[:3]
        sources = [{
            "title": r.get("title"),
            "link": r.get("link"),
            "snippet": BeautifulSoup(r.get("snippet", ""), "html.parser").text
        } for r in results]

        if sources:
            return f"✅ Found {len(sources)} sources", sources
        return "⚠️ No fact-checkable sources found.", []
    except Exception as e:
        return f"❌ Search failed: {e}", []
