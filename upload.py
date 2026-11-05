import json, os, sys, requests

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

missing = [name for name, value in (
    ("SUPABASE_URL", SUPABASE_URL),
    ("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_KEY),
) if not value]
if missing:
    sys.exit(
        "Error: missing environment variable(s): " + ", ".join(missing) + "\n"
        "Set them before running upload.py, e.g. in PowerShell:\n"
        '  $env:SUPABASE_URL="https://<project-ref>.supabase.co"\n'
        '  $env:SUPABASE_SERVICE_ROLE_KEY="<service role key>"'
    )

SUPABASE_URL = SUPABASE_URL.rstrip("/")

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
