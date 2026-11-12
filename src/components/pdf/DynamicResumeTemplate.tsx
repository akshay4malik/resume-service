import React from 'react';
import { ResumeData } from '@/lib/schemas/resume';
import { ResumeTemplate as Template1 } from './ResumeTemplate';
import { Template12 } from './templates/Template12';
import { Template15 } from './templates/Template15';
import { Template16 } from './templates/Template16';
import { Template17 } from './templates/Template17';
import { Template19 } from './templates/Template19';
import { Template20 } from './templates/Template20';
import { Template21 } from './templates/Template21';

export interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  previewUrl: string;
}

export const TEMPLATES: TemplateDefinition[] = [
  { id: 'template1', name: 'Professional Classic', category: 'Executive', description: 'Clean, ATS-friendly corporate standard.', previewUrl: '/previews/template1_preview.png' },
  { id: 'template12', name: 'Modern Minimal', category: 'Tech', description: 'Minimalist with crisp teal accents.', previewUrl: '/previews/template12_preview.png' },
  { id: 'template15', name: 'Academic CV', category: 'Academic', description: 'Serif academic typography for research & higher education.', previewUrl: '/previews/template15_preview.png' },
  { id: 'template16', name: 'ATS-Optimized', category: 'General', description: 'Maximized parsing efficiency for applicant tracking algorithms.', previewUrl: '/previews/template16_preview.png' },
  { id: 'template17', name: 'Tech Startup', category: 'Developer', description: 'Developer-oriented with badge highlights and modern blue accents.', previewUrl: '/previews/template17_preview.png' },
  { id: 'template19', name: 'International Format', category: 'Corporate', description: 'Structured corporate format with block sections and navy banners.', previewUrl: '/previews/template19_preview.png' },
  { id: 'template20', name: 'Classic Two-Column', category: 'Creative', description: 'Sidebar profile for skills and contact; wide column for experience.', previewUrl: '/previews/template20_preview.png' },
  { id: 'template21', name: 'Analyst Professional', category: 'Finance', description: 'High-density, structured layout for data analysts and consultants.', previewUrl: '/previews/template21_preview.png' },
];

export const DynamicResumeTemplate: React.FC<{ templateId?: string; data: ResumeData }> = ({
  templateId = 'template1',
  data,
}) => {
  switch (templateId) {
    case 'template12':
      return <Template12 data={data} />;
    case 'template15':
      return <Template15 data={data} />;
    case 'template16':
      return <Template16 data={data} />;
    case 'template17':
      return <Template17 data={data} />;
    case 'template19':
      return <Template19 data={data} />;
    case 'template20':
      return <Template20 data={data} />;
    case 'template21':
      return <Template21 data={data} />;
    case 'template1':
    default:
      return <Template1 data={data} />;
  }
};
export default DynamicResumeTemplate;

