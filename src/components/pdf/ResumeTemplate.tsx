import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '@/lib/schemas/resume';

// Template 1: Professional Classic (Clean, ATS-friendly corporate standard)
const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 38,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1a202c',
    lineHeight: 1.34,
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 8,
  },
  fullName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 6,
    lineHeight: 1.2,
  },
  professionalTitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f766e',
    marginBottom: 6,
    lineHeight: 1.2,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    fontSize: 8.5,
    color: '#475569',
    lineHeight: 1.2,
  },
  section: {
    marginTop: 8,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f2942',
    borderBottomWidth: 0.8,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 2,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  itemBlock: {
    marginBottom: 5.5,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 1.5,
  },
  itemTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#0f172a',
  },
  itemCompany: {
    fontFamily: 'Helvetica-Bold',
    color: '#0f766e',
  },
  itemSubtitle: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 8,
    color: '#64748b',
    marginBottom: 1,
  },
  dateRange: {
    fontSize: 8,
    color: '#64748b',
    fontFamily: 'Helvetica',
  },
  bulletList: {
    marginTop: 1.5,
    paddingLeft: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 1.5,
  },
  bulletDot: {
    width: 7,
    fontSize: 8,
    color: '#475569',
  },
  bulletContent: {
    flex: 1,
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.3,
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 2,
    fontSize: 8.5,
    lineHeight: 1.25,
  },
  skillCategory: {
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    width: 140,
  },
  skillItems: {
    flex: 1,
    color: '#334155',
  },
  summaryText: {
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.34,
  },
});

interface ResumeTemplateProps {
  data: ResumeData;
}

export const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {
  const {
    personal_info,
    summary,
    experience = [],
    education = [],
    skills = [],
    projects = [],
    awards = [],
  } = data as any;

  const fullName = `${personal_info?.first_name || ''} ${personal_info?.last_name || ''}`.trim() || 'Your Name';

  const contactItems: string[] = [
    personal_info?.email,
    personal_info?.phone,
    [personal_info?.city, personal_info?.state].filter(Boolean).join(', '),
    personal_info?.linkedin,
    personal_info?.github,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.fullName}>{fullName}</Text>
          {personal_info?.professional_title && (
            <Text style={styles.professionalTitle}>{personal_info.professional_title}</Text>
          )}
          {contactItems.length > 0 && (
            <View style={styles.contactRow}>
              <Text>{contactItems.join('   •   ')}</Text>
            </View>
          )}
        </View>

        {/* Summary */}
        {(summary || personal_info?.summary) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{summary || personal_info?.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {experience.map((exp: any, index: number) => (
              <View key={index} style={styles.itemBlock}>
                <View style={styles.rowHeader}>
                  <Text style={styles.itemTitle}>
                    {exp.job_title} <Text style={styles.itemCompany}>| {exp.company}</Text>
                  </Text>
                  <Text style={styles.dateRange}>
                    {exp.start_date || ''} {exp.end_date ? `– ${exp.end_date}` : exp.current ? '– Present' : ''}
                  </Text>
                </View>
                {exp.location ? <Text style={styles.itemSubtitle}>{exp.location}</Text> : null}
                {exp.description ? <Text style={styles.summaryText}>{exp.description}</Text> : null}
                {exp.achievements && exp.achievements.length > 0 && (
                  <View style={styles.bulletList}>
                    {exp.achievements.map((ach: string, i: number) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletContent}>{ach}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu: any, index: number) => (
              <View key={index} style={styles.itemBlock}>
                <View style={styles.rowHeader}>
                  <Text style={styles.itemTitle}>
                    {edu.degree} <Text style={styles.itemCompany}>| {edu.institution}</Text>
                  </Text>
                  <Text style={styles.dateRange}>
                    {edu.start_date || ''} {edu.end_date ? `– ${edu.end_date}` : ''}
                  </Text>
                </View>
                <Text style={styles.summaryText}>
                  {[
                    edu.location,
                    edu.gpa ? `GPA: ${edu.gpa}` : null,
                    edu.relevant_coursework?.length ? `Coursework: ${edu.relevant_coursework.join(', ')}` : null,
                  ]
                    .filter(Boolean)
                    .join('   •   ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            {skills.map((skill: any, index: number) => (
              <View key={index} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{skill.category}:</Text>
                <Text style={styles.skillItems}>
                  {Array.isArray(skill.items) ? skill.items.join(', ') : skill.items || ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Projects</Text>
            {projects.map((proj: any, index: number) => (
              <View key={index} style={styles.itemBlock}>
                <View style={styles.rowHeader}>
                  <Text style={styles.itemTitle}>{proj.name}</Text>
                  <Text style={styles.dateRange}>
                    {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies || ''}
                  </Text>
                </View>
                {proj.description && <Text style={styles.summaryText}>{proj.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Honors & Awards</Text>
            {awards.map((aw: any, index: number) => (
              <View key={index} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{aw.title}:</Text>
                <Text style={styles.skillItems}>
                  {aw.organization} {aw.year ? `(${aw.year})` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ResumeTemplate;
