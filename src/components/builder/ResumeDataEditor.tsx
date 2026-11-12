'use client';

import React, { useState } from 'react';
import { ResumeData, PersonalInfo, Experience, Education, Skill, Project } from '@/lib/schemas/resume';
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ResumeDataEditorProps {
  data: ResumeData;
  onChange: (updated: ResumeData) => void;
}

export const ResumeDataEditor: React.FC<ResumeDataEditorProps> = ({ data, onChange }) => {
  const [activeSection, setActiveSection] = useState<'personal' | 'experience' | 'education' | 'skills' | 'projects'>('personal');

  // Update Personal Info
  const handlePersonalChange = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...data,
      personal_info: {
        ...data.personal_info,
        [field]: value,
      },
    });
  };

  // Experience handlers
  const handleExperienceChange = (index: number, field: keyof Experience, value: any) => {
    const updated = [...data.experience];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, experience: updated });
  };

  const handleAchievementChange = (expIdx: number, achIdx: number, value: string) => {
    const updated = [...data.experience];
    const achievements = [...(updated[expIdx].achievements || [])];
    achievements[achIdx] = value;
    updated[expIdx] = { ...updated[expIdx], achievements };
    onChange({ ...data, experience: updated });
  };

  const addAchievement = (expIdx: number) => {
    const updated = [...data.experience];
    const achievements = [...(updated[expIdx].achievements || []), ''];
    updated[expIdx] = { ...updated[expIdx], achievements };
    onChange({ ...data, experience: updated });
  };

  const removeAchievement = (expIdx: number, achIdx: number) => {
    const updated = [...data.experience];
    const achievements = (updated[expIdx].achievements || []).filter((_, i) => i !== achIdx);
    updated[expIdx] = { ...updated[expIdx], achievements };
    onChange({ ...data, experience: updated });
  };

  const addExperience = () => {
    const newExp: Experience = {
      job_title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: 'Present',
      current: true,
      description: '',
      achievements: [''],
    };
    onChange({ ...data, experience: [newExp, ...data.experience] });
  };

  const removeExperience = (index: number) => {
    onChange({ ...data, experience: data.experience.filter((_, i) => i !== index) });
  };

  // Education handlers
  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    const updated = [...data.education];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, education: updated });
  };

  const addEducation = () => {
    const newEdu: Education = {
      degree: '',
      institution: '',
      location: '',
      start_date: '',
      end_date: '',
      gpa: '',
      thesis_title: '',
      relevant_coursework: [],
    };
    onChange({ ...data, education: [newEdu, ...data.education] });
  };

  const removeEducation = (index: number) => {
    onChange({ ...data, education: data.education.filter((_, i) => i !== index) });
  };

  // Skills handlers
  const handleSkillCategoryChange = (index: number, cat: string) => {
    const updated = [...data.skills];
    updated[index] = { ...updated[index], category: cat };
    onChange({ ...data, skills: updated });
  };

  const handleSkillItemsChange = (index: number, rawItems: string) => {
    const updated = [...data.skills];
    const items = rawItems.split(',').map((s) => s.trim()).filter(Boolean);
    updated[index] = { ...updated[index], items };
    onChange({ ...data, skills: updated });
  };

  const addSkillCategory = () => {
    const newSkill: Skill = { category: 'New Category', items: [] };
    onChange({ ...data, skills: [...data.skills, newSkill] });
  };

  const removeSkillCategory = (index: number) => {
    onChange({ ...data, skills: data.skills.filter((_, i) => i !== index) });
  };

  // Projects handlers
  const handleProjectChange = (index: number, field: keyof Project, value: any) => {
    const updated = [...data.projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, projects: updated });
  };

  const addProject = () => {
    const newProj: Project = {
      name: '',
      description: '',
      technologies: [],
      start_date: '',
      end_date: '',
      demo_link: '',
      github_link: '',
    };
    onChange({ ...data, projects: [newProj, ...data.projects] });
  };

  const removeProject = (index: number) => {
    onChange({ ...data, projects: data.projects.filter((_, i) => i !== index) });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveSection('personal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeSection === 'personal' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Contact</span>
        </button>
        <button
          onClick={() => setActiveSection('experience')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeSection === 'experience' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Experience ({data.experience?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveSection('education')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeSection === 'education' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Education ({data.education?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveSection('skills')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeSection === 'skills' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Skills ({data.skills?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveSection('projects')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            activeSection === 'projects' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects ({data.projects?.length || 0})</span>
        </button>
      </div>

      {/* 1. Personal & Contact Details */}
      {activeSection === 'personal' && (
        <div className="bg-canvas-card border border-sand-border rounded-2xl p-5 shadow-xs flex flex-col gap-3">
          <h3 className="text-xs font-bold text-ink-dark uppercase tracking-wider">Candidate & Contact Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-ink-muted block mb-1">First Name</label>
              <input
                type="text"
                value={data.personal_info?.first_name || ''}
                onChange={(e) => handlePersonalChange('first_name', e.target.value)}
                className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-ink-muted block mb-1">Last Name</label>
              <input
                type="text"
                value={data.personal_info?.last_name || ''}
                onChange={(e) => handlePersonalChange('last_name', e.target.value)}
                className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-ink-muted block mb-1">Email</label>
              <input
                type="email"
                value={data.personal_info?.email || ''}
                onChange={(e) => handlePersonalChange('email', e.target.value)}
                className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-ink-muted block mb-1">Phone</label>
              <input
                type="text"
                value={data.personal_info?.phone || ''}
                onChange={(e) => handlePersonalChange('phone', e.target.value)}
                className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-ink-muted block mb-1">City</label>
              <input
                type="text"
                value={data.personal_info?.city || ''}
                onChange={(e) => handlePersonalChange('city', e.target.value)}
                className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-ink-muted block mb-1">State / Region</label>
              <input
                type="text"
                value={data.personal_info?.state || ''}
                onChange={(e) => handlePersonalChange('state', e.target.value)}
                className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-ink-muted block mb-1">Country</label>
              <input
                type="text"
                value={data.personal_info?.country || ''}
                onChange={(e) => handlePersonalChange('country', e.target.value)}
                className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-ink-muted block mb-1">Professional Title</label>
              <input
                type="text"
                value={data.personal_info?.professional_title || ''}
                onChange={(e) => handlePersonalChange('professional_title', e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-ink-muted block mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={data.personal_info?.linkedin || ''}
                onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                placeholder="linkedin.com/in/username"
                className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-ink-muted block mb-1">Professional Summary</label>
            <textarea
              rows={4}
              value={data.personal_info?.summary || ''}
              onChange={(e) => handlePersonalChange('summary', e.target.value)}
              className="w-full bg-canvas border border-sand-border rounded-lg p-2.5 text-xs text-ink focus:border-sky-500 resize-y"
            />
          </div>
        </div>
      )}

      {/* 2. Experience */}
      {activeSection === 'experience' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-ink-dark uppercase tracking-wider">Work Experience</h3>
            <button
              onClick={addExperience}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Role</span>
            </button>
          </div>

          {data.experience.map((exp, expIdx) => (
            <div key={expIdx} className="bg-canvas-card border border-sand-border rounded-2xl p-4 shadow-xs flex flex-col gap-3 relative">
              <button
                onClick={() => removeExperience(expIdx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition"
                title="Remove experience"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-3 pr-6">
                <div>
                  <label className="text-[11px] font-medium text-ink-muted block mb-1">Job Title</label>
                  <input
                    type="text"
                    value={exp.job_title}
                    onChange={(e) => handleExperienceChange(expIdx, 'job_title', e.target.value)}
                    className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-ink-muted block mb-1">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(expIdx, 'company', e.target.value)}
                    className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-ink-muted block mb-1">Start Date</label>
                  <input
                    type="text"
                    value={exp.start_date || ''}
                    onChange={(e) => handleExperienceChange(expIdx, 'start_date', e.target.value)}
                    placeholder="e.g. 2021 or Jan 2021"
                    className="w-full bg-canvas border border-sand-border rounded-lg p-1.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-ink-muted block mb-1">End Date</label>
                  <input
                    type="text"
                    value={exp.end_date || ''}
                    onChange={(e) => handleExperienceChange(expIdx, 'end_date', e.target.value)}
                    placeholder="e.g. Present"
                    className="w-full bg-canvas border border-sand-border rounded-lg p-1.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-ink-muted block mb-1">Location</label>
                  <input
                    type="text"
                    value={exp.location || ''}
                    onChange={(e) => handleExperienceChange(expIdx, 'location', e.target.value)}
                    placeholder="e.g. Remote"
                    className="w-full bg-canvas border border-sand-border rounded-lg p-1.5 text-xs text-ink"
                  />
                </div>
              </div>

              {/* Achievements Bullet Points */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-medium text-ink-muted">Key Achievements & Bullet Points</label>
                  <button
                    onClick={() => addAchievement(expIdx)}
                    className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add bullet
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {(exp.achievements || []).map((ach, achIdx) => (
                    <div key={achIdx} className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">•</span>
                      <input
                        type="text"
                        value={ach}
                        onChange={(e) => handleAchievementChange(expIdx, achIdx, e.target.value)}
                        className="flex-1 bg-canvas border border-sand-border rounded-lg p-1.5 text-xs text-ink"
                      />
                      <button
                        onClick={() => removeAchievement(expIdx, achIdx)}
                        className="text-slate-300 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Education */}
      {activeSection === 'education' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-ink-dark uppercase tracking-wider">Education</h3>
            <button
              onClick={addEducation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Degree</span>
            </button>
          </div>

          {data.education.map((edu, eduIdx) => (
            <div key={eduIdx} className="bg-canvas-card border border-sand-border rounded-2xl p-4 shadow-xs flex flex-col gap-3 relative">
              <button
                onClick={() => removeEducation(eduIdx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-3 pr-6">
                <div>
                  <label className="text-[11px] font-medium text-ink-muted block mb-1">Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(eduIdx, 'degree', e.target.value)}
                    className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-ink-muted block mb-1">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(eduIdx, 'institution', e.target.value)}
                    className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-ink-muted block mb-1">Graduation Year</label>
                  <input
                    type="text"
                    value={edu.start_date || ''}
                    onChange={(e) => handleEducationChange(eduIdx, 'start_date', e.target.value)}
                    placeholder="e.g. 2020"
                    className="w-full bg-canvas border border-sand-border rounded-lg p-1.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-ink-muted block mb-1">Grade / GPA (Optional)</label>
                  <input
                    type="text"
                    value={edu.gpa || ''}
                    onChange={(e) => handleEducationChange(eduIdx, 'gpa', e.target.value)}
                    placeholder="e.g. 3.8 / First Class"
                    className="w-full bg-canvas border border-sand-border rounded-lg p-1.5 text-xs text-ink"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Skills */}
      {activeSection === 'skills' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-ink-dark uppercase tracking-wider">Skills Categories</h3>
            <button
              onClick={addSkillCategory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          {data.skills.map((skill, sIdx) => (
            <div key={sIdx} className="bg-canvas-card border border-sand-border rounded-2xl p-4 shadow-xs flex flex-col gap-2.5 relative">
              <button
                onClick={() => removeSkillCategory(sIdx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="pr-6">
                <label className="text-[11px] font-medium text-ink-muted block mb-1">Category Name</label>
                <input
                  type="text"
                  value={skill.category}
                  onChange={(e) => handleSkillCategoryChange(sIdx, e.target.value)}
                  placeholder="e.g. Languages & Frameworks"
                  className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-ink-muted block mb-1">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={(skill.items || []).join(', ')}
                  onChange={(e) => handleSkillItemsChange(sIdx, e.target.value)}
                  placeholder="e.g. React, TypeScript, Node.js, Next.js"
                  className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Projects */}
      {activeSection === 'projects' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-ink-dark uppercase tracking-wider">Featured Projects</h3>
            <button
              onClick={addProject}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          {data.projects.map((proj, pIdx) => (
            <div key={pIdx} className="bg-canvas-card border border-sand-border rounded-2xl p-4 shadow-xs flex flex-col gap-3 relative">
              <button
                onClick={() => removeProject(pIdx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="pr-6">
                <label className="text-[11px] font-medium text-ink-muted block mb-1">Project Name</label>
                <input
                  type="text"
                  value={proj.name}
                  onChange={(e) => handleProjectChange(pIdx, 'name', e.target.value)}
                  className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-ink-muted block mb-1">Description & Impact</label>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => handleProjectChange(pIdx, 'description', e.target.value)}
                  className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-ink-muted block mb-1">Technologies (comma-separated)</label>
                <input
                  type="text"
                  value={(proj.technologies || []).join(', ')}
                  onChange={(e) => handleProjectChange(pIdx, 'technologies', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                  placeholder="e.g. Python, PyTorch, AWS"
                  className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

