from docx import Document
import os, json

doc = Document("grandpas_book.docx.docx")
chapters = []
current = {"title": "Introduction", "number": 0, "content": "", "images": []}

for para in doc.paragraphs:
    if para.style.name.startswith("Heading"):
        if current["content"]:
            chapters.append(current)
        current = {
            "title": para.text,
            "number": len(chapters) + 1,
            "content": "",
            "images": []
        }
    else:
        current["content"] += para.text + "\n"

chapters.append(current)

os.makedirs("images", exist_ok=True)
img_count = 0
for rel in doc.part.rels.values():
    if "image" in rel.reltype:
        img = rel.target_part.blob
        path = f"images/img_{img_count}.png"
        with open(path, "wb") as f:
            f.write(img)
        img_count += 1

with open("chapters.json", "w", encoding="utf-8") as f:
    json.dump(chapters, f, ensure_ascii=False, indent=2)

print(f"Done! {len(chapters)} chapters, {img_count} images extracted.")
