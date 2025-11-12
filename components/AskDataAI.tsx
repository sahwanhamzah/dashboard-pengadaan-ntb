import React, { useState } from 'react';
// FIX: Use the correct import 'GoogleGenAI' instead of the deprecated 'GoogleGenerativeAI'.
import { GoogleGenAI } from '@google/genai';
import { marked } from 'marked';
import { Project } from '../types';

interface AskDataAIProps {
  projects: Project[];
}

// Inisialisasi API Key dari environment variables
const API_KEY = process.env.GEMINI_API_KEY;

const AskDataAI: React.FC<AskDataAIProps> = ({ projects }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const exampleQuestions = [
    "Berapa total nilai pagu dari semua proyek?",
    "Sebutkan 3 proyek dengan realisasi anggaran terbesar.",
    "Ada berapa proyek yang ditangani oleh Dinas Pekerjaan Umum dan Penataan Ruang?",
    "Tampilkan daftar proyek yang statusnya masih 'Dalam Proses'.",
  ];

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('Silakan tulis pertanyaan Anda.');
      return;
    }
    if (!API_KEY) {
        setError("Kunci API Gemini belum diatur. Silakan atur di Vercel Environment Variables.");
        return;
    }

    setIsLoading(true);
    setError('');
    setAnswer('');

    try {
      // FIX: Initialize the GenAI client with a named apiKey parameter as required.
      const ai = new GoogleGenAI({ apiKey: API_KEY });

      // Sederhanakan data proyek agar lebih efisien
      const simplifiedData = projects.map(p => ({
        nama: p.name,
        jenis: p.type,
        lokasi: p.location,
        status: p.status,
        opd: p.opdName,
        pagu: p.budget,
        realisasi: p.realization,
      }));

      const prompt = `Anda adalah seorang analis data yang ahli dalam menganalisis data pengadaan barang dan jasa. Berdasarkan data JSON berikut, jawab pertanyaan pengguna dengan ringkas, akurat, dan dalam format Markdown. Data: ${JSON.stringify(simplifiedData, null, 2)}\n\nPertanyaan: ${question}`;

      // FIX: Use the modern 'ai.models.generateContent' API instead of the deprecated 'getGenerativeModel' and 'generateContent' chain.
      // FIX: Use a recommended model 'gemini-2.5-flash' instead of the deprecated 'gemini-pro'.
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      // FIX: Access the response text directly via the '.text' property instead of calling '.text()'.
      const text = response.text;
      
      const htmlAnswer = marked.parse(text);
      setAnswer(htmlAnswer as string);

    } catch (err: any) {
      console.error("Error calling Gemini API:", err);
      setError("Terjadi kesalahan saat menghubungi AI. Mungkin ada masalah dengan kunci API atau koneksi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExampleClick = (q: string) => {
      setQuestion(q);
      // Optional: auto-submit when an example is clicked
      // handleAsk(); 
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.25 21.75l-.648-1.178a3.375 3.375 0 00-2.455-2.456L12 17.25l1.178-.648a3.375 3.375 0 002.455-2.456L16.25 13l.648 1.178a3.375 3.375 0 002.456 2.456L20.25 17.25l-1.178.648a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </div>
        <div className="w-full">
            <h3 className="text-xl font-bold text-slate-900">Tanya Data dengan AI</h3>
            <p className="text-sm text-slate-500 mt-1">Ajukan pertanyaan tentang data pengadaan dalam bahasa Indonesia.</p>

            <div className="mt-3 flex gap-2 flex-wrap">
                {exampleQuestions.map((q, i) => (
                    <button key={i} onClick={() => handleExampleClick(q)} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md hover:bg-slate-200 transition-colors">
                        {q}
                    </button>
                ))}
            </div>

            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAsk()}
                    placeholder="Tulis pertanyaan Anda di sini..."
                    className="flex-grow w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={isLoading}
                />
                <button
                    onClick={handleAsk}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-wait"
                >
                    {isLoading ? '...' : 'Tanya'}
                </button>
            </div>
            
             {error && <p className="text-red-500 text-sm mt-3 bg-red-50 p-3 rounded-md">{error}</p>}
            
            {isLoading && <div className="mt-4 text-center text-slate-500">AI sedang berpikir...</div>}

            {answer && (
            <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold text-slate-800 mb-2">Jawaban AI:</h4>
                <div 
                    className="prose prose-sm max-w-none prose-pre:bg-slate-100 prose-pre:p-4 prose-pre:rounded-md prose-code:text-slate-700"
                    dangerouslySetInnerHTML={{ __html: answer }}
                ></div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AskDataAI;