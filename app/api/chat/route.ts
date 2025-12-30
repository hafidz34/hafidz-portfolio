import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import Groq from 'groq-sdk';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    // Embedding dengan Pinecone Cloud
    const embedding = await pinecone.inference.embed(
      "multilingual-e5-large",
      [lastMessage],
      { inputType: 'query' }
    );

    // Cari konteks dari Pinecone
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
    const queryResponse = await index.query({
      vector: embedding[0].values, // Ambil hasil vector dari cloud
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
    Prioritaskan kenyamanan pembaca. Jangan memaksakan bullet points jika kalimat biasa lebih 
    mengalir, tapi jangan membuat tembok teks jika isinya adalah daftar poin.

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