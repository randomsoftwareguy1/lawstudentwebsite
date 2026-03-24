import React from 'react';
import Layout from '../components/layout/Layout';
import { content } from '../data/content';
import { ArrowRight, FileText, PenTool, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Home = () => {
  return (
    <Layout>
      <div className="container-wide">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl mb-8 leading-[0.9]">
              {content.name}
            </h1>
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-12">
              <span className="text-xs uppercase tracking-[0.3em] font-bold opacity-40">
                {content.title}
              </span>
              <div className="hidden md:block w-12 h-px bg-border"></div>
              <p className="text-xl md:text-2xl font-serif italic opacity-70">
                {content.tagline}
              </p>
            </div>
            
            <p className="text-lg md:text-xl max-w-2xl leading-relaxed opacity-80 mb-12">
              {content.summary}
            </p>
            
            <div className="flex flex-wrap gap-6">
              <Link to="/experience" className="btn-primary flex items-center gap-3">
                View Experience <ArrowRight size={14} />
              </Link>
              <Link to="/writing" className="btn-outline flex items-center gap-3">
                Writing Samples <FileText size={14} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Highlights Section */}
        <section className="py-24 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <h2 className="text-4xl mb-6">Core Focus</h2>
              <p className="text-muted text-sm leading-relaxed">
                My legal training is defined by a commitment to rigorous inquiry and the development of sustainable legal frameworks for the digital age.
              </p>
            </div>
            
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-12">
              {content.about.interests.map((interest, index) => (
                <div key={index} className="p-8 border border-border hover:border-ink transition-colors duration-500 group">
                  <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center mb-6 group-hover:bg-ink group-hover:text-paper transition-all duration-500">
                    <span className="text-[10px] font-bold">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="text-2xl mb-4">{interest}</h3>
                  <p className="text-sm text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Specialized research and practical application in {interest.toLowerCase()} within global legal contexts.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Writing Preview */}
        <section className="py-24 border-t border-border">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl mb-4">Selected Writing</h2>
              <p className="text-muted text-sm">A selection of recent academic and professional work.</p>
            </div>
            <Link to="/writing" className="nav-link flex items-center gap-2">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.writing.slice(0, 2).map((sample, index) => (
              <div key={index} className="bg-paper p-10 border border-border hover:shadow-xl transition-all duration-500">
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-4 block">
                  {sample.type} — {sample.date}
                </span>
                <h3 className="text-3xl mb-4 leading-tight">{sample.title}</h3>
                <p className="text-muted text-sm mb-8 line-clamp-2">{sample.description}</p>
                <div className="flex gap-2">
                  {sample.tags.map(tag => (
                    <span key={tag} className="text-[9px] uppercase tracking-tighter border border-border px-2 py-1 opacity-60">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-ink text-paper -mx-6 md:-mx-12 lg:-mx-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl mb-12 leading-tight">
              Interested in discussing a potential collaboration or professional opportunity?
            </h2>
            <Link to="/contact" className="inline-flex items-center gap-4 px-12 py-5 border border-paper/30 hover:bg-paper hover:text-ink transition-all duration-500 text-sm uppercase tracking-[0.2em] font-bold">
              Get in Touch <Mail size={18} />
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
