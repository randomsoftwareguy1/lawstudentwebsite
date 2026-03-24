# The Advocate - Professional Law Student Portfolio Template

A refined, editorial-grade personal brand website template designed specifically for law students and legal professionals. This project prioritizes clarity, precision, and professional credibility through a disciplined visual language and robust technical architecture.

## Overview

This template is built to serve as a high-quality professional asset for legal professionals who want to establish a serious digital presence. It moves away from generic student portfolios in favor of an aesthetic that mirrors elite law firm biographies and academic profiles.

### Key Features

- **Editorial Design:** A typography-first aesthetic using a sophisticated pairing of serif and sans-serif fonts.
- **Responsive Architecture:** Fully optimized for desktop, tablet, and mobile devices.
- **SEO Optimized:** Built-in metadata, Open Graph support, sitemap, and robots.txt.
- **Professional Narrative:** Structured sections for biography, legal experience, writing samples, and contact.
- **Performance:** Lightweight and fast-loading, optimized for deployment on Vercel.

## Tech Stack

- **Framework:** React with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **Animation:** Motion (formerly Framer Motion)
- **Icons:** Lucide React
- **SEO:** React Helmet Async
- **Routing:** React Router

## Getting Started

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:
```bash
npm run dev
```

### Build

Create a production build:
```bash
npm run build
```

## Customization Guide

The template is designed to be "plug and play." Most of the content is centralized in a single file for easy updates.

### Updating Content

All personal information, experience, and writing samples are located in:
`src/data/content.ts`

Simply update the `content` object with your own details:
- **Name & Title:** Update your professional identity.
- **Summary:** Refine your positioning statement.
- **Experience:** Add your internships, clerkships, and roles.
- **Writing:** Showcase your law review notes, memos, and articles.
- **SEO:** Update keywords and descriptions to improve search ranking for your name.

### Visual Settings

The theme colors and typography are defined in:
`src/index.css`

You can adjust the `--color-*` variables and font imports to match your personal brand.

## Deployment on Vercel

1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com).
3. Vercel will automatically detect the Vite project and deploy it.
4. Ensure your `APP_URL` environment variable is set in the Vercel dashboard if you use self-referential links.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
