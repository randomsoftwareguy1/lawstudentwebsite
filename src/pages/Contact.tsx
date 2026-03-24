import React from 'react';
import Layout from '../components/layout/Layout';
import { content } from '../data/content';
import { motion } from 'motion/react';
import { Mail, Linkedin, MapPin, ArrowRight } from 'lucide-react';

const Contact = () => {
  const [formState, setFormState] = React.useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => {
      setFormState('success');
    }, 1500);
  };

  return (
    <Layout title="Contact">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl mb-16">Contact</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div className="space-y-12">
              <p className="text-2xl font-serif italic opacity-70 leading-relaxed max-w-md">
                I am always open to discussing legal research, professional opportunities, or scholarly inquiries.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-1">Email</h3>
                    <a href={`mailto:${content.contact.email}`} className="text-xl hover:opacity-60 transition-opacity">
                      {content.contact.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center shrink-0">
                    <Linkedin size={18} />
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-1">LinkedIn</h3>
                    <a href={`https://${content.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-xl hover:opacity-60 transition-opacity">
                      {content.contact.linkedin}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-1">Location</h3>
                    <p className="text-xl">
                      {content.contact.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-paper p-8 md:p-12 border border-border">
              {formState === 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-ink text-paper flex items-center justify-center mb-6">
                    <ArrowRight size={24} />
                  </div>
                  <h2 className="text-3xl mb-4">Message Received</h2>
                  <p className="text-muted text-sm max-w-xs">
                    Thank you for your inquiry. I will review your message and respond as soon as possible.
                  </p>
                  <button 
                    onClick={() => setFormState('idle')}
                    className="mt-8 text-xs uppercase tracking-widest font-bold border-b border-ink pb-1"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-[10px] uppercase tracking-widest font-bold opacity-40">Full Name</label>
                      <input 
                        required
                        type="text" 
                        id="name" 
                        className="w-full bg-transparent border-b border-border py-3 focus:border-ink outline-none transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold opacity-40">Email Address</label>
                      <input 
                        required
                        type="email" 
                        id="email" 
                        className="w-full bg-transparent border-b border-border py-3 focus:border-ink outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-[10px] uppercase tracking-widest font-bold opacity-40">Subject</label>
                    <input 
                      required
                      type="text" 
                      id="subject" 
                      className="w-full bg-transparent border-b border-border py-3 focus:border-ink outline-none transition-colors"
                      placeholder="Professional Inquiry"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-[10px] uppercase tracking-widest font-bold opacity-40">Message</label>
                    <textarea 
                      required
                      id="message" 
                      rows={5}
                      className="w-full bg-transparent border border-border p-4 focus:border-ink outline-none transition-colors resize-none"
                      placeholder="How can I help you?"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={formState === 'submitting'}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {formState === 'submitting' ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Contact;
