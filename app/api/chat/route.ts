import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import Groq from 'groq-sdk';
import { pipeline } from '@xenova/transformers';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class EmbeddingPipeline {
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: any = null;
  
  static async getInstance() {
    if (this.instance === null) {
      this.instance = await pipeline('feature-extraction', this.model);
    }
    return this.instance;
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    const extractor = await EmbeddingPipeline.getInstance();
    const output = await extractor(lastMessage, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(output.data);

    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
    const queryResponse = await index.query({
      vector: queryVector as number[],
      topK: 5, 
      includeMetadata: true,
    });

    const contextText = queryResponse.matches
      .map((match) => match.metadata?.text)
      .join('\n---\n');

    const systemPrompt = `
    PERAN:
    Kamu adalah asisten profesional untuk portofolio "Muhammad Hafidz Rizki".

    GAYA BICARA:
    - Profesional, ramah, dan manusiawi (tidak kaku seperti robot).
    - Gunakan sudut pandang orang ketiga ("Hafidz" atau "Dia").

    INSTRUKSI FORMATTING (PENTING - GUNAKAN LOGIKA):
    Kamu memiliki kebebasan untuk memilih format jawaban yang paling enak dibaca:

    1. GUNAKAN PARAGRAF (NARASI) JIKA:
       - Sedang menceritakan alur pengalaman atau cerita.
       - Menjelaskan sesuatu yang butuh konteks kalimat penghubung.
       - Poin yang disebutkan hanya sedikit (1-2 hal).
       - Contoh: "Hafidz memiliki pengalaman magang di SPIL di mana ia membangun dashboard analitik." (Lebih baik paragraf).

    2. GUNAKAN BULLET POINTS (-) JIKA:
       - Menyebutkan daftar data mentah yang banyak (lebih dari 3 item).
       - Merinci spesifikasi teknis (tech stack), daftar tugas harian, atau pro & kontra yang kompleks.
       - Tujuannya agar pembaca bisa memindai (scan) informasi dengan cepat.

    TUJUAN:
    Prioritaskan kenyamanan pembaca. Jangan memaksakan bullet points jika kalimat biasa lebih mengalir, tapi jangan membuat tembok teks jika isinya adalah daftar poin.

    DATA FAKTA:
    ${contextText}
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages 
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
    });

    const reply = completion.choices[0]?.message?.content || "Maaf, sistem sedang sibuk.";
    
    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}