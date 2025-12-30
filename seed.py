import json
import time
import os
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

if not PINECONE_API_KEY:
    print("Error: PINECONE_API_KEY tidak ditemukan di file .env")
    exit()

pc = Pinecone(api_key=PINECONE_API_KEY)

if INDEX_NAME in pc.list_indexes().names():
    print(f"Menghapus index lama '{INDEX_NAME}'...")
    pc.delete_index(INDEX_NAME)
    time.sleep(5) 

print("Membuat index baru...")
pc.create_index(
    name=INDEX_NAME,
    dimension=1024, 
    metric="cosine",
    spec={"serverless": {"cloud": "aws", "region": "us-east-1"}}
)

while not pc.describe_index(INDEX_NAME).status['ready']:
    time.sleep(1)

index = pc.Index(INDEX_NAME)

print("Membaca file CV...")
with open('cv_data.json', 'r') as f:
    data = json.load(f)

# Chunking data
def create_chunks(data):
    chunks = []
    
    # Personal
    info = data['personal_info']
    text = f"Candidate Profile: {info['name']}. Role: {info['role']}. Summary: {info['summary']} Education: {info['degree']}."
    chunks.append({"id": "personal", "text": text})
    
    # Work Experience
    for i, job in enumerate(data['work_experience']):
        achievements = " ".join(job['key_achievements'])
        text = f"Work Experience / Pengalaman Kerja (Internship/Fulltime) at {job['company']} ({job['period']}) as {job['role']}. Description: {job['description']} Achievements: {achievements}"
        chunks.append({"id": f"job_{i}", "text": text})

    # Volunteering
    if 'volunteering' in data:
        for i, vol in enumerate(data['volunteering']):
            text = f"Volunteering Experience / Sukarelawan: {vol['role']} at {vol['org']} ({vol['period']}). Details: {vol['details']}"
            chunks.append({"id": f"vol_{i}", "text": text})

    # Organizations
    if 'organizations' in data:
        for i, org in enumerate(data['organizations']):
            text = f"Organizational Experience / Organisasi: {org['role']} at {org['name']} ({org['period']}). Details: {org['details']}"
            chunks.append({"id": f"org_{i}", "text": text})
        
    # Projects
    for i, proj in enumerate(data['projects']):
        stack = ", ".join(proj['tech_stack'])
        text = f"Project: {proj['name']}. Role: {proj['role']}. Tech Stack: {stack}. Description: {proj['description']} Details: {proj['details']}"
        chunks.append({"id": f"proj_{i}", "text": text})

    # Certifications
    if 'certifications' in data:
        certs = ", ".join(data['certifications'])
        text = f"Certifications / Sertifikat: {certs}"
        chunks.append({"id": "certs", "text": text})

    # Skills
    skills = data['technical_skills']
    spoken = ", ".join(skills.get('spoken_languages', []))
    text = f"Skills. Tech: {', '.join(skills['languages'] + skills['frameworks_libraries'])}. Soft Skills: {', '.join(skills['soft_skills'])}. Spoken Languages: {spoken}."
    chunks.append({"id": "skills", "text": text})
    
    return chunks

chunks = create_chunks(data)
vectors = []

print(f"Memproses {len(chunks)} data dengan Pinecone Cloud...")

# Proses embedding dan upsert ke Pinecone
texts = [item['text'] for item in chunks]
embeddings = pc.inference.embed(
    model="multilingual-e5-large",
    inputs=texts,
    parameters={"input_type": "passage", "truncate": "END"}
)

for i, item in enumerate(chunks):
    vectors.append({ 
        "id": item['id'], 
        "values": embeddings[i]['values'], 
        "metadata": {"text": item['text']} 
    })

index.upsert(vectors=vectors)
print("Database AI CV berhasil dibuat di Pinecone Cloud.")