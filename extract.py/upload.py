import json, os, requests

SUPABASE_URL = "https://csjappdlptoigwxjcgvv.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzamFwcGRscHRvaWd3eGpjZ3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzM1NzgsImV4cCI6MjA5MDcwOTU3OH0.cCZZ7VzXM2gQ1fMo5UX3IymeTbBAcnl23R5Gp80Ux3Q"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

with open("chapters.json", encoding="utf-8") as f:
    chapters = json.load(f)

print(f"Uploading {len(chapters)} chapters...")
for i, ch in enumerate(chapters):
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/chapters",
        headers=headers,
        json={
            "title": ch["title"],
            "chapter_number": ch["number"],
            "content": ch["content"]
        }
    )
    if r.status_code in (200, 201):
        print(f"✓ {i+1}/{len(chapters)}: {ch['title']}")
    else:
        print(f"✗ {i+1}: {r.text}")

print("Done!")
