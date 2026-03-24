export interface ExperienceItem {
  role: string;
  organization: string;
  location: string;
  period: string;
  description: string[];
}

export interface WritingSample {
  title: string;
  type: string;
  date: string;
  description: string;
  link: string;
  tags: string[];
}

export interface SiteContent {
  name: string;
  title: string;
  tagline: string;
  summary: string;
  about: {
    intro: string;
    narrative: string[];
    interests: string[];
  };
  experience: ExperienceItem[];
  writing: WritingSample[];
  contact: {
    email: string;
    linkedin: string;
    twitter?: string;
    location: string;
  };
  seo: {
    description: string;
    keywords: string[];
  };
}

export const content: SiteContent = {
  name: "Julianna R. Sterling",
  title: "J.D. Candidate",
  tagline: "Advocating for clarity in complex regulatory environments.",
  summary: "A third-year law student at Columbia Law School with a focused interest in international arbitration, corporate governance, and the intersection of technology and trade law.",
  about: {
    intro: "I am a legal scholar and advocate driven by the belief that precision in language is the foundation of justice.",
    narrative: [
      "My journey into the law began with a fascination for how international treaties shape local economies. Growing up in a diplomatic household, I witnessed firsthand the power of structured negotiation and the critical importance of clear, enforceable legal frameworks.",
      "At Columbia Law School, I have dedicated my research to the evolving landscape of digital trade. I believe that as technology outpaces traditional legislation, the role of the lawyer is not just to interpret existing rules, but to help architect the new ones that will define the next century of global commerce.",
      "Beyond the classroom, I have served as a Senior Editor for the Columbia Law Review, where I honed my commitment to rigorous analysis and editorial excellence. My professional goal is to join a global practice where I can contribute to high-stakes dispute resolution and strategic advisory."
    ],
    interests: ["International Arbitration", "Digital Trade Policy", "Corporate Governance", "Legal Philosophy"]
  },
  experience: [
    {
      role: "Summer Associate",
      organization: "Sullivan & Cromwell LLP",
      location: "New York, NY",
      period: "May 2025 – August 2025",
      description: [
        "Conducted extensive research for the International Arbitration group on bilateral investment treaty (BIT) disputes involving sovereign states.",
        "Drafted memoranda on jurisdictional challenges in ICSID proceedings and assisted in the preparation of witness statements for a multi-billion dollar commercial arbitration.",
        "Collaborated with senior partners to analyze the impact of new EU data privacy regulations on cross-border mergers and acquisitions."
      ]
    },
    {
      role: "Judicial Intern",
      organization: "U.S. District Court, Southern District of New York",
      location: "New York, NY",
      period: "June 2024 – August 2024",
      description: [
        "Served under the Honorable Jed S. Rakoff, assisting with legal research and the drafting of judicial opinions on complex civil litigation matters.",
        "Observed courtroom proceedings, including oral arguments and sentencing hearings, providing daily summaries and analysis to the chambers.",
        "Researched evolving standards for class action certification in securities litigation."
      ]
    },
    {
      role: "Research Assistant",
      organization: "Columbia Law School",
      location: "New York, NY",
      period: "September 2023 – Present",
      description: [
        "Assisting Professor Anu Bradford with research for the upcoming edition of 'The Brussels Effect', focusing on digital sovereignty and AI regulation.",
        "Synthesizing complex regulatory filings from the European Commission and the FTC to identify emerging trends in global antitrust enforcement."
      ]
    }
  ],
  writing: [
    {
      title: "The Digital Sovereignty Paradox",
      type: "Law Review Note",
      date: "Spring 2025",
      description: "An analysis of how national data localization laws conflict with international trade obligations under the WTO.",
      link: "#",
      tags: ["Trade Law", "Technology", "International Law"]
    },
    {
      title: "Arbitrating the Algorithm",
      type: "Article",
      date: "Fall 2024",
      description: "Exploring the feasibility of using automated dispute resolution systems in small-claims international commercial contracts.",
      link: "#",
      tags: ["Arbitration", "AI", "Legal Tech"]
    },
    {
      title: "Memorandum on Sovereign Immunity",
      type: "Academic Paper",
      date: "Winter 2023",
      description: "A comparative study of the Foreign Sovereign Immunities Act (FSIA) and the UK State Immunity Act.",
      link: "#",
      tags: ["Litigation", "Sovereignty"]
    }
  ],
  contact: {
    email: "j.sterling@law.columbia.edu",
    linkedin: "linkedin.com/in/julianna-sterling",
    location: "New York, New York"
  },
  seo: {
    description: "Personal brand website of Julianna R. Sterling, J.D. Candidate at Columbia Law School. Focused on international arbitration and trade law.",
    keywords: ["Law Student", "Columbia Law", "International Arbitration", "Legal Professional", "Julianna Sterling"]
  }
};
