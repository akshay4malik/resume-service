import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '@/lib/schemas/resume';

// Template 19: International Corporate (Navy Accent #1E3A8A, clean header badge)
const styles19 = StyleSheet.create({
  page: { paddingHorizontal: 38, paddingTop: 32, paddingBottom: 32, fontSize: 9, fontFamily: 'Helvetica', color: '#1e293b', lineHeight: 1.34 },
  header: { marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 8 },
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#1e3a8a', marginBottom: 6, lineHeight: 1.2 },
  title: { fontSize: 10.5, color: '#334155', marginBottom: 6, fontFamily: 'Helvetica-Bold', lineHeight: 1.2 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', fontSize: 8.5, color: '#64748b', lineHeight: 1.2 },
  section: { marginTop: 8, marginBottom: 2 },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    backgroundColor: '#f1f5f9',
    padding: '2.5 5',
    marginBottom: 4,
    textTransform: 'uppercase',
    borderRadius: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 1.5 },
  jobTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#0f172a' },
  company: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#1e3a8a' },
  date: { fontSize: 8, color: '#64748b' },
  bullet: { flexDirection: 'row', marginTop: 1.5, paddingLeft: 6, marginBottom: 1.5 },
  bulletDot: { width: 7, fontSize: 7, color: '#1e3a8a', marginTop: 1 },
  bulletText: { flex: 1, fontSize: 8.5, color: '#334155', lineHeight: 1.3 },
  text: { fontSize: 8.5, color: '#334155', lineHeight: 1.34 },
  skillRow: { flexDirection: 'row', marginBottom: 2, fontSize: 8.5, lineHeight: 1.25 },
});

export const Template19: React.FC<{ data: ResumeData }> = ({ data }) => {
  const p = data.personal_info;
  const contact = [p?.email, p?.phone, [p?.city, p?.country || p?.state].filter(Boolean).join(', '), p?.linkedin, p?.github].filter(Boolean).join('   •   ');
  return (
    <Document>
      <Page size="A4" style={styles19.page}>
        <View style={styles19.header}>
          <Text style={styles19.name}>{p?.first_name} {p?.last_name}</Text>
          {p?.professional_title && <Text style={styles19.title}>{p.professional_title}</Text>}
          {contact && <Text style={styles19.text}>{contact}</Text>}
        </View>

        {(p?.summary || (data as any).summary) && (
          <View style={styles19.section}>
            <Text style={styles19.sectionTitle}>Executive Summary</Text>
            <Text style={styles19.text}>{p?.summary || (data as any).summary}</Text>
          </View>
        )}

        {data.experience && data.experience.length > 0 && (
          <View style={styles19.section}>
            <Text style={styles19.sectionTitle}>Professional Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 5 }}>
                <View style={styles19.row}>
                  <Text style={styles19.jobTitle}>{exp.job_title} <Text style={styles19.company}>| {exp.company}</Text></Text>
                  <Text style={styles19.date}>{exp.start_date} – {exp.end_date || 'Present'}</Text>
                </View>
                {exp.description ? <Text style={styles19.text}>{exp.description}</Text> : null}
                {exp.achievements?.map((ach, j) => (
                  <View key={j} style={styles19.bullet}>
                    <Text style={styles19.bulletDot}>■</Text>
                    <Text style={styles19.bulletText}>{ach}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.education && data.education.length > 0 && (
          <View style={styles19.section}>
            <Text style={styles19.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <View style={styles19.row}>
                  <Text style={styles19.jobTitle}>{edu.degree} <Text style={styles19.company}>| {edu.institution}</Text></Text>
                  <Text style={styles19.date}>{edu.start_date} – {edu.end_date}</Text>
                </View>
                <Text style={styles19.text}>
                  {[edu.location, edu.gpa ? `GPA: ${edu.gpa}` : null, edu.relevant_coursework?.join(', ')].filter(Boolean).join(' • ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {data.skills && data.skills.length > 0 && (
          <View style={styles19.section}>
            <Text style={styles19.sectionTitle}>Skills & Expertise</Text>
            {data.skills.map((s, i) => (
              <View key={i} style={styles19.skillRow}>
                <Text style={{ fontFamily: 'Helvetica-Bold', color: '#0f172a', width: 140 }}>{s.category}: </Text>
                <Text style={{ flex: 1, color: '#334155' }}>{Array.isArray(s.items) ? s.items.join(', ') : s.items}</Text>
              </View>
            ))}
          </View>
        )}

        {data.projects && data.projects.length > 0 && (
          <View style={styles19.section}>
            <Text style={styles19.sectionTitle}>Key Projects</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={{ marginBottom: 3 }}>
                <View style={styles19.row}>
                  <Text style={styles19.jobTitle}>{proj.name}</Text>
                  <Text style={styles19.date}>{Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}</Text>
                </View>
                <Text style={styles19.text}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
export default Template19;
