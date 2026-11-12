import { ResumeData } from '@/lib/schemas/resume';

export const COMPREHENSIVE_SAMPLE_RESUME: ResumeData = {
  personal_info: {
    first_name: 'Alex',
    last_name: 'Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 019-2834',
    professional_title: 'Senior Software Architect',
    summary:
      'Results-driven Senior Software Architect with 8+ years of expertise in distributed cloud architectures, serverless microservices, and high-throughput web platforms. Proven track record leading engineering teams, reducing cloud operational spend by 45%, and designing resilient systems processing millions of daily transactions.',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
  },
  experience: [
    {
      job_title: 'Staff Software Architect',
      company: 'TechFlow Global',
      location: 'San Francisco, CA',
      start_date: '2022',
      end_date: 'Present',
      current: true,
      description:
        'Lead engineering architecture and technical strategy for enterprise cloud services serving 4.5M active monthly users.',
      achievements: [
        'Architected real-time edge processing pipeline reducing global p99 API latency from 240ms to 28ms.',
        'Spearheaded migration of legacy services to Kubernetes, cutting cloud operational expenditure by $320k annually.',
        'Mentored 14 core engineers in distributed systems design, observability, and zero-downtime deployment pipelines.',
      ],
    },
    {
      job_title: 'Senior Full Stack Engineer',
      company: 'Apex Cloud Solutions',
      location: 'San Francisco, CA',
      start_date: '2019',
      end_date: '2022',
      current: false,
      description:
        'Owned customer-facing telemetry dashboard and automated analytics reporting pipeline.',
      achievements: [
        'Designed interactive analytics platform using React, TypeScript, and Redis caching with sub-second response times.',
        'Implemented automated CI/CD test coverage exceeding 94% across business-critical financial transaction flows.',
        'Collaborated with product leadership to execute 12 major releases ahead of schedule with zero rollbacks.',
      ],
    },
    {
      job_title: 'Software Engineer',
      company: 'DataCore Systems',
      location: 'Berkeley, CA',
      start_date: '2017',
      end_date: '2019',
      current: false,
      description:
        'Engineered RESTful APIs and distributed data processing pipelines using Node.js and PostgreSQL.',
      achievements: [
        'Built automated document ingestion pipeline processing 50,000+ files daily with 99.98% reliability.',
        'Optimized PostgreSQL query execution plans, eliminating database lock contention and boosting throughput 3.5x.',
      ],
    },
  ],
  education: [
    {
      degree: 'B.S. in Computer Science',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      start_date: '2013',
      end_date: '2017',
      gpa: '3.85',
      relevant_coursework: [
        'Distributed Systems',
        'Algorithms & Data Structures',
        'Cloud Computing',
        'Database Architecture',
      ],
    },
  ],
  skills: [
    {
      category: 'Languages & Core',
      items: ['TypeScript', 'JavaScript (ES6+)', 'Python', 'Go', 'SQL', 'HTML5/CSS3'],
    },
    {
      category: 'Frameworks & Frontend',
      items: ['React 18', 'Next.js 15', 'Node.js', 'Tailwind CSS', 'Redux Toolkit', 'GraphQL'],
    },
    {
      category: 'Cloud & Infrastructure',
      items: ['AWS (ECS, Lambda, S3, RDS)', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'Supabase'],
    },
    {
      category: 'Tools & DevOps',
      items: ['Git/GitHub Actions', 'Terraform', 'Jest', 'Cypress', 'Prometheus', 'Datadog'],
    },
  ],
  projects: [
    {
      name: 'Serverless Resume Engine',
      description:
        'Engineered high-concurrency client-side PDF synthesis engine rendering ATS-compliant documents with zero server latency.',
      technologies: ['Next.js', 'TypeScript', 'Web Workers', '@react-pdf/renderer'],
    },
    {
      name: 'Distributed Task Queue',
      description:
        'Built high-throughput distributed message processing queue handling 100k+ events/sec with strict deduplication.',
      technologies: ['Go', 'Redis', 'Docker', 'gRPC'],
    },
  ],
  awards: [
    {
      title: 'Distinguished Engineering Excellence Award',
      organization: 'TechFlow Global',
      year: '2023',
    },
  ],
  languages: [{ language: 'English', proficiency: 'Native' }],
  publications: [],
  interests: ['Distributed Systems', 'Open Source', 'High-Performance Computing'],
  references: [],
};

