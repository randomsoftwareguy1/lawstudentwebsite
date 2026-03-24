import React from 'react';
import Layout from '../components/layout/Layout';
import { content } from '../data/content';
import { motion } from 'motion/react';

const About = () => {
  return (
    <Layout title="About">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 mb-8 block">
            Professional Narrative
          </span>
          <h1 className="text-5xl md:text-7xl mb-12 leading-tight">
            {content.about.intro}
          </h1>
          
          <div className="space-y-8 text-lg md:text-xl leading-relaxed opacity-80 font-light">
            {content.about.narrative.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-24 pt-12 border-t border-border">
            <h2 className="text-3xl mb-8">Areas of Intellectual Interest</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.about.interests.map((interest, index) => (
                <div key={index} className="flex items-center gap-4 group">
                  <div className="w-2 h-2 bg-ink opacity-20 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-lg font-serif italic opacity-70 group-hover:opacity-100 transition-opacity">
                    {interest}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-24 bg-ink/5 p-12 rounded-sm italic font-serif text-xl text-center opacity-70">
            "The law is the witness and external deposit of our moral life. Its history is the history of the moral development of the race."
            <span className="block mt-4 text-xs uppercase tracking-widest font-bold not-italic opacity-60">— Oliver Wendell Holmes Jr.</span>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default About;
