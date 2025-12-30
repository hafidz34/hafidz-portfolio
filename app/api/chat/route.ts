import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  console.log("--- MULAI API CHAT ---"); // [LOG 1] Penanda Mulai

  try {
    // [CHECK 1] Pastikan Kunci Ada (Seringkali ini penyebab error 500)
    if (!process.env.PINECONE_API_KEY || !process.env.GROQ_API_KEY || !process.env.PINECONE_INDEX_NAME) {
      throw new Error("Kunci Rahasia (API KEY) belum dimasukkan di Netlify!");
    }

    // [INIT] Inisialisasi di dalam try/catch agar aman
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;
    console.log("📩 Pesan masuk:", lastMessage); // [LOG 2] Cek pesan

    // Embedding dengan Pinecone Cloud
    console.log("🔄 Sedang Embedding..."); 
    const embedding = await pinecone.inference.embed(
      "multilingual-e5-large",
      [lastMessage],
      { inputType: 'query' }
    );

    // [CHECK 2] Pastikan hasil embedding valid
    const vectorValues = (embedding as any)[0]?.values;
    if (!vectorValues) throw new Error("Gagal membuat vector (Embedding kosong).");

    // Cari konteks dari Pinecone
    console.log("🔎 Mencari di Database...");
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    const queryResponse = await index.query({
      vector: vectorValues, 
      topK: 5, 
      includeMetadata: true,
    });
    console.log(`✅ Ditemukan ${queryResponse.matches.length} data.`);

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

    // Kirim ke Groq
    console.log("🤖 Mengirim ke Groq...");
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages 
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
    });

    const reply = completion.choices[0]?.message?.content || "Maaf, sistem sedang sibuk.";
    console.log("✅ Selesai.");
    
    return NextResponse.json({ reply });

  } catch (error: any) {
    // [LOGGING ERROR FATAL]
    console.error("❌ ERROR:", error);
    console.error("Pesan:", error.message);
    
    // [PENTING] Kirim pesan error ke Chat Bubble supaya kamu bisa baca
    // Status 200 supaya frontend tidak error, tapi menampilkan pesan masalahnya
    return NextResponse.json({ 
      reply: `⚠️ TERJADI ERROR: ${error.message}. (Cek Logs Netlify untuk detail)` 
    }, { status: 200 });
  }
}