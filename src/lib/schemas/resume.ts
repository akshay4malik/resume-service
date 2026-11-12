/**
 * @file src/lib/schemas/resume.ts
 * @description Zod schemas for resume data — ported 1:1 from Python Pydantic models.
 *
 * Also exports `normalizeResumeData()` which mirrors the Python `_normalize_resume_data()`
 * function (resume.py lines 49–208) exactly.
 */

import { z } from 'zod'

// =============================================================================
// SCHEMAS
// =============================================================================

export const PersonalInfoSchema = z.object({
  first_name:         z.string().default(''),
  last_name:          z.string().default(''),
  email:              z.string().default(''),
  phone:              z.string().nullable().optional(),
  address:            z.string().nullable().optional(),
  city:               z.string().nullable().optional(),
  state:              z.string().nullable().optional(),
  country:            z.string().nullable().optional(),
  linkedin:           z.string().nullable().optional(),
  github:             z.string().nullable().optional(),
  website:            z.string().nullable().optional(),
  twitter:            z.string().nullable().optional(),
  professional_title: z.string().nullable().optional(),
  summary:            z.string().nullable().optional(),
})

export const EducationSchema = z.object({
  degree:             z.string().default(''),
  institution:        z.string().default(''),
  location:           z.string().nullable().optional(),
  start_date:         z.string().nullable().optional(),
  end_date:           z.string().nullable().optional(),
  gpa:                z.string().nullable().optional(),
  thesis_title:       z.string().nullable().optional(),
  relevant_coursework: z.array(z.string()).default([]),
})

export const ExperienceSchema = z.object({
  job_title:    z.string().default(''),
  company:      z.string().default(''),
  location:     z.string().nullable().optional(),
  start_date:   z.string().default(''),
  end_date:     z.string().nullable().optional(),
  current:      z.boolean().default(false),
  description:  z.string().nullable().optional(),
  achievements: z.array(z.string()).default([]),
})

export const ProjectSchema = z.object({
  name:         z.string().default(''),
  description:  z.string().default(''),
  technologies: z.array(z.string()).default([]),
  start_date:   z.string().nullable().optional(),
  end_date:     z.string().nullable().optional(),
  demo_link:    z.string().nullable().optional(),
  github_link:  z.string().nullable().optional(),
})

export const SkillSchema = z.object({
  category: z.string().default('Skills'),
  items:    z.array(z.string()).default([]),
})

export const PublicationSchema = z.object({
  title:   z.string().default(''),
  authors: z.string().default(''),
  journal: z.string().default(''),
  year:    z.string().default(''),
  doi:     z.string().nullable().optional(),
})

export const AwardSchema = z.object({
  title:        z.string().default(''),
  organization: z.string().default(''),
  year:         z.string().default(''),
  description:  z.string().nullable().optional(),
})

export const LanguageSchema = z.object({
  language:    z.string().default(''),
  proficiency: z.string().default(''),
})

export const ReferenceSchema = z.object({
  name:         z.string().default(''),
  title:        z.string().default(''),
  organization: z.string().default(''),
  email:        z.string().nullable().optional(),
  phone:        z.string().nullable().optional(),
})

export const ResumeDataSchema = z.object({
  personal_info: PersonalInfoSchema,
  education:     z.array(EducationSchema).default([]),
  experience:    z.array(ExperienceSchema).default([]),
  skills:        z.array(SkillSchema).default([]),
  projects:      z.array(ProjectSchema).default([]),
  languages:     z.array(LanguageSchema).default([]),
  awards:        z.array(AwardSchema).default([]),
  publications:  z.array(PublicationSchema).default([]),
  interests:     z.array(z.string()).default([]),
  references:    z.array(ReferenceSchema).default([]),
})

// =============================================================================
// INFERRED TYPESCRIPT TYPES
// =============================================================================

export type PersonalInfo  = z.infer<typeof PersonalInfoSchema>
export type Education     = z.infer<typeof EducationSchema>
export type Experience    = z.infer<typeof ExperienceSchema>
export type Project       = z.infer<typeof ProjectSchema>
export type Skill         = z.infer<typeof SkillSchema>
export type Publication   = z.infer<typeof PublicationSchema>
export type Award         = z.infer<typeof AwardSchema>
export type Language      = z.infer<typeof LanguageSchema>
export type Reference     = z.infer<typeof ReferenceSchema>
export type ResumeData    = z.infer<typeof ResumeDataSchema>

// =============================================================================
// NORMALIZATION  (mirrors resume.py _normalize_resume_data, lines 49–208)
// =============================================================================

function toStr(v: unknown, fallback = ''): string {
  if (v == null) return fallback
  if (typeof v === 'string') return v.trim()
  return String(v).trim()
}

function toNullStr(v: unknown): string | null {
  if (v == null) return null
  const s = typeof v === 'string' ? v.trim() : String(v).trim()
  return s.length > 0 ? s : null
}

function toArray<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[]
  return []
}

function toStrArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => (typeof x === 'string' ? x.trim() : String(x).trim())).filter(Boolean)
}

/**
 * Normalizes raw (potentially incomplete) resume JSON data.
 * Mirrors Python's `_normalize_resume_data()` exactly.
 */
export function normalizeResumeData(raw: Record<string, unknown>): Record<string, unknown> {
  // ── personal_info ──────────────────────────────────────────────────────────
  const pi = (raw.personal_info != null && typeof raw.personal_info === 'object'
    ? raw.personal_info
    : {}) as Record<string, unknown>

  const personalInfo: Record<string, unknown> = {
    first_name:         toStr(pi.first_name,  'Unknown'),
    last_name:          toStr(pi.last_name,   'User'),
    email:              toStr(pi.email,        'user@example.com'),
    phone:              toNullStr(pi.phone)?.slice(0, 20) ?? null,
    address:            toNullStr(pi.address),
    city:               toNullStr(pi.city),
    state:              toNullStr(pi.state),
    country:            toNullStr(pi.country),
    linkedin:           toNullStr(pi.linkedin),
    github:             toNullStr(pi.github),
    website:            toNullStr(pi.website),
    twitter:            toNullStr(pi.twitter),
    professional_title: toNullStr(pi.professional_title),
    summary:            toNullStr(pi.summary),
  }

  // ── education ──────────────────────────────────────────────────────────────
  const education = toArray<unknown>(raw.education).map((item) => {
    const e = (item != null && typeof item === 'object' ? item : {}) as Record<string, unknown>
    const gpaRaw = toNullStr(e.gpa)
    return {
      degree:              toStr(e.degree,      'Unknown Degree'),
      institution:         toStr(e.institution, 'Unknown Institution'),
      location:            toNullStr(e.location),
      start_date:          toNullStr(e.start_date),
      end_date:            toNullStr(e.end_date),
      gpa:                 gpaRaw ? gpaRaw.slice(0, 100) : null,
      thesis_title:        toNullStr(e.thesis_title),
      relevant_coursework: toStrArray(e.relevant_coursework),
    }
  })

  // ── experience ─────────────────────────────────────────────────────────────
  const experience = toArray<unknown>(raw.experience).map((item) => {
    const e = (item != null && typeof item === 'object' ? item : {}) as Record<string, unknown>
    return {
      job_title:    toStr(e.job_title, 'Unknown Title'),
      company:      toStr(e.company,   'Unknown Company'),
      location:     toNullStr(e.location),
      start_date:   toStr(e.start_date, ''),
      end_date:     toNullStr(e.end_date),
      current:      Boolean(e.current),
      description:  toNullStr(e.description),
      achievements: toStrArray(e.achievements),
    }
  })

  // ── projects ───────────────────────────────────────────────────────────────
  const projects = toArray<unknown>(raw.projects).map((item) => {
    const p = (item != null && typeof item === 'object' ? item : {}) as Record<string, unknown>
    return {
      name:         toStr(p.name,        'Unknown Project'),
      description:  toStr(p.description, ''),
      technologies: toStrArray(p.technologies),
      start_date:   toNullStr(p.start_date),
      end_date:     toNullStr(p.end_date),
      demo_link:    toNullStr(p.demo_link),
      github_link:  toNullStr(p.github_link),
    }
  })

  // ── skills ─────────────────────────────────────────────────────────────────
  const skills = toArray<unknown>(raw.skills).map((item) => {
    const s = (item != null && typeof item === 'object' ? item : {}) as Record<string, unknown>
    return {
      category: toStr(s.category, 'General'),
      items:    toStrArray(s.items),
    }
  })

  // ── awards ─────────────────────────────────────────────────────────────────
  // Python handles both string and object formats
  const awards = toArray<unknown>(raw.awards).map((item) => {
    if (typeof item === 'string') {
      return {
        title:        item.trim(),
        organization: 'Unknown',
        year:         '2024',
        description:  null,
      }
    }
    const a = (item != null && typeof item === 'object' ? item : {}) as Record<string, unknown>
    return {
      title:        toStr(a.title,        'Unknown Award'),
      organization: toStr(a.organization, 'Unknown'),
      year:         toStr(a.year,         '2024'),  // year is required, fallback "2024"
      description:  toNullStr(a.description),
    }
  })

  // ── languages ──────────────────────────────────────────────────────────────
  // Python handles both string and object formats
  const languages = toArray<unknown>(raw.languages).map((item) => {
    if (typeof item === 'string') {
      return {
        language:    item.trim(),
        proficiency: 'Conversational',
      }
    }
    const l = (item != null && typeof item === 'object' ? item : {}) as Record<string, unknown>
    return {
      language:    toStr(l.language,    'Unknown'),
      proficiency: toStr(l.proficiency, 'Conversational'),
    }
  })

  // ── publications ───────────────────────────────────────────────────────────
  const publications = toArray<unknown>(raw.publications).map((item) => {
    const p = (item != null && typeof item === 'object' ? item : {}) as Record<string, unknown>
    return {
      title:   toStr(p.title,   'Unknown'),
      authors: toStr(p.authors, 'Unknown'),
      journal: toStr(p.journal, 'Unknown'),
      year:    toStr(p.year,    '2024'),
      doi:     toNullStr(p.doi),
    }
  })

  // ── references ─────────────────────────────────────────────────────────────
  const references = toArray<unknown>(raw.references).map((item) => {
    const r = (item != null && typeof item === 'object' ? item : {}) as Record<string, unknown>
    return {
      name:         toStr(r.name,         'Unknown'),
      title:        toStr(r.title,        'Unknown'),
      organization: toStr(r.organization, 'Unknown'),
      email:        toNullStr(r.email),
      phone:        toNullStr(r.phone)?.slice(0, 20) ?? null,
    }
  })

  // ── interests ──────────────────────────────────────────────────────────────
  const interests = toStrArray(raw.interests)

  return {
    personal_info: personalInfo,
    education,
    experience,
    skills,
    projects,
    languages,
    awards,
    publications,
    interests,
    references,
  }
}
