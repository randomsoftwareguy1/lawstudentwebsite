import React from 'react';
import Layout from '../components/layout/Layout';
import { content } from '../data/content';
import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

const Writing = () => {
  return (
    <Layout title="Writing">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl mb-16">Writing</h1>
          
          <div className="grid grid-cols-1 gap-12">
            {content.writing.map((sample, index) => (
              <div 
                key={index} 
                className="group border-b border-border pb-12 hover:border-ink transition-colors duration-500"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                  <div className="lg:col-span-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 block mb-2">
                      {sample.type}
                    </span>
                    <span className="text-sm font-serif italic opacity-60">
                      {sample.date}
                    </span>
                  </div>
                  
                  <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-3xl md:text-4xl leading-tight group-hover:opacity-70 transition-opacity">
                      {sample.title}
                    </h2>
                    <p className="text-muted text-sm md:text-base max-w-xl leading-relaxed">
                      {sample.description}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {sample.tags.map(tag => (
                        <span key={tag} className="text-[9px] uppercase tracking-widest border border-border px-3 py-1 opacity-60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1 lg:text-right">
                    <a 
                      href={sample.link} 
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold opacity-60 hover:opacity-100 transition-opacity"
                    >
                      Read Sample <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-32 p-16 bg-ink text-paper text-center">
            <h2 className="text-3xl mb-6">Additional Samples</h2>
            <p className="opacity-60 text-sm max-w-lg mx-auto mb-8">
              Full writing samples, including legal memoranda and published articles, are available upon request for professional review.
            </p>
            <a href={`mailto:${content.contact.email}`} className="nav-link text-paper opacity-100 hover:opacity-70 border-b border-paper/30 pb-1">
              Request Portfolio
            </a>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Writing;
