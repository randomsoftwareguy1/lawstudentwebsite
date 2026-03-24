import React from 'react';
import { content } from '../../data/content';
import { Mail, Linkedin, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-top border-border py-24 bg-paper">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-6">
            <h3 className="font-serif text-2xl">{content.name}</h3>
            <p className="text-muted max-w-sm text-sm">
              Dedicated to legal excellence, rigorous analysis, and the pursuit of clarity in a complex world.
            </p>
            <div className="flex space-x-6 pt-4">
              <a href={`mailto:${content.contact.email}`} className="opacity-60 hover:opacity-100 transition-opacity">
                <Mail size={18} />
              </a>
              <a href={`https://${content.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="hover:opacity-60 transition-opacity">Home</a></li>
                <li><a href="/about" className="hover:opacity-60 transition-opacity">About</a></li>
                <li><a href="/experience" className="hover:opacity-60 transition-opacity">Experience</a></li>
                <li><a href="/writing" className="hover:opacity-60 transition-opacity">Writing</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">Contact</h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 opacity-60">
                  <MapPin size={14} /> {content.contact.location}
                </p>
                <p className="opacity-60">{content.contact.email}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-24 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">
          <p>© {currentYear} {content.name}. All Rights Reserved.</p>
          <p>Professional Portfolio Template</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
