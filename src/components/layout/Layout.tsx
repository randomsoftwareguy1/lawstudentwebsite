import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from './Navbar';
import Footer from './Footer';
import { content } from '../../data/content';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, description }) => {
  const fullTitle = title ? `${title} | ${content.name}` : `${content.name} | ${content.title}`;
  const metaDescription = description || content.seo.description;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={metaDescription} />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
