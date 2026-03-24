import React from 'react';
import Layout from '../components/layout/Layout';
import { content } from '../data/content';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';

const Experience = () => {
  return (
    <Layout title="Experience">
      <div className="container-wide">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-between items-end mb-16">
              <h1 className="text-6xl md:text-8xl">Experience</h1>
              <a 
                href="#" 
                className="nav-link flex items-center gap-2 pb-2 border-b border-border hover:border-ink transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  alert("In a production environment, this would trigger a PDF download of the resume.");
                }}
              >
                Download Resume <Download size={14} />
              </a>
            </div>

            <div className="space-y-24">
              {content.experience.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-8 group">
                  <div className="md:col-span-1">
                    <span className="text-xs uppercase tracking-widest font-bold opacity-40">
                      {item.period}
                    </span>
                  </div>
                  <div className="md:col-span-3 space-y-6">
                    <div>
                      <h2 className="text-3xl mb-1">{item.role}</h2>
                      <h3 className="text-xl font-serif italic opacity-60">
                        {item.organization} — {item.location}
                      </h3>
                    </div>
                    <ul className="space-y-4 max-w-2xl">
                      {item.description.map((bullet, bIndex) => (
                        <li key={bIndex} className="text-sm md:text-base leading-relaxed opacity-80 flex gap-4">
                          <span className="mt-2 w-1.5 h-1.5 bg-ink/20 shrink-0"></span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Experience;
