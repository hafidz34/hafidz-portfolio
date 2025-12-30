'use client';

import { useState, useEffect } from 'react';
import { portfolioData } from './portfolio-data';
import ChatSection from './components/ChatSection';
import { Github, Linkedin, MapPin, Briefcase, Award, ShieldCheck, Heart, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { personal, experience, volunteering, education, certifications, awards, skills } = portfolioData;

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="shrink-0 relative"
            >
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl rotate-3 border-4 border-white bg-slate-200">
                <img src="/profile.jpg" alt={personal.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-xl shadow-lg flex items-center gap-2 border border-slate-100">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-700">Hello :D</span>
              </div>
            </motion.div>

            <div className="text-center md:text-left flex-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
                  {personal.name}
                </h1>
                <p className="text-lg md:text-2xl text-slate-600 font-medium mb-6 leading-relaxed">
                  {personal.role}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-8">
                   {skills.slice(0, 5).map((s, i) => (
                     <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-semibold rounded-md border border-slate-200">
                       {s}
                     </span>
                   ))}
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {/* Download My CV */}
                  <a 
                    href="/cv.pdf" 
                    download="CV_Muhammad_Hafidz_Rizki"
                    className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
                  >
                    <Download size={20}/> Download My CV
                  </a>

                  {/* My LinkedIn */}
                  <a href={personal.linkedin} target="_blank" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2">
                    <Linkedin size={20}/> My LinkedIn
                  </a>

                  {/* My GitHub */}
                  <a href={personal.github} target="_blank" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center gap-2">
                    <Github size={20}/> My GitHub
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Experience */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Briefcase size={20}/></div>
                <h2 className="text-xl font-bold">Experience</h2>
              </div>
              <div className="space-y-8">
                {experience.map((job, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-slate-100 last:border-0">
                    <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <h3 className="font-bold text-lg">{job.role}</h3>
                    <p className="text-sm text-slate-500 mb-2">{job.company} • {job.period}</p>
                    <p className="text-slate-600 text-sm leading-relaxed">{job.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Volunteering */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Heart size={20}/></div>
                <h2 className="text-xl font-bold">Volunteering</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {volunteering.map((vol, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h3 className="font-bold text-sm mb-1">{vol.role}</h3>
                    <p className="text-xs text-slate-500 mb-2">{vol.org}</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{vol.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* About Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">About Me</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {personal.about}
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={16}/> {personal.location}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
               <div className="flex items-center gap-3 mb-4">
                <ShieldCheck size={20} className="text-emerald-400"/>
                <h2 className="text-lg font-bold">Certifications</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300">
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Education & Awards */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Award size={20}/></div>
                <h2 className="text-lg font-bold">Education & Awards</h2>
              </div>
              
              <div className="mb-6">
                 {education.map((edu, i) => (
                   <div key={i}>
                     <h3 className="font-bold text-sm">{edu.school}</h3>
                     <p className="text-xs text-slate-500">{edu.degree}</p>
                     <p className="text-xs text-slate-400">{edu.year}</p>
                   </div>
                 ))}
              </div>
              
              <div className="space-y-3">
                 {awards.map((aw, i) => (
                   <div key={i} className="flex gap-2 text-xs text-slate-600 font-medium">
                     <span>🏆</span> <span>{aw}</span>
                   </div>
                 ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* AI Chat Section */}
      <ChatSection />

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-center text-sm">
        <p>© 2025 {personal.name}</p>
      </footer>
    </main>
  );
}