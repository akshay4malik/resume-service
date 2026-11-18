import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '@/lib/schemas/resume';

// Template 12 (Modern Minimal - Clean, sleek teal accents, subtle dividers)
const styles12 = StyleSheet.create({
  page: { paddingHorizontal: 38, paddingTop: 32, paddingBottom: 32, fontSize: 9, fontFamily: 'Helvetica', color: '#1e293b', lineHeight: 1.34 },
  header: { textAlign: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 8 },
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 6, lineHeight: 1.2 },
  title: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: '#0f766e', marginBottom: 6, lineHeight: 1.2 },
  contact: { fontSize: 8.5, color: '#64748b', lineHeight: 1.2 },
  section: { marginTop: 8, marginBottom: 2 },
  sectionTitle: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#0f766e', textTransform: 'uppercase', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 1.5 },
  jobTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#0f172a' },
  company: { fontFamily: 'Helvetica-Bold', color: '#0f766e', fontSize: 9 },
  date: { fontSize: 8, color: '#64748b' },
  bullet: { flexDirection: 'row', marginTop: 1.5, paddingLeft: 6, marginBottom: 1.5 },
  bulletDot: { width: 7, fontSize: 8, color: '#0f766e' },
  bulletText: { flex: 1, fontSize: 8.5, color: '#334155', lineHeight: 1.3 },
  text: { fontSize: 8.5, color: '#334155', lineHeight: 1.34 },
  skillRow: { flexDirection: 'row', marginBottom: 2, fontSize: 8.5, lineHeight: 1.25 },
  skillCategory: { fontFamily: 'Helvetica-Bold', color: '#0f172a', width: 140 },
  skillItems: { flex: 1, color: '#334155' },
});

export const Template12: React.FC<{ data: ResumeData }> = ({ data }) => {
  const p = data.personal_info;
  const contact = [p?.email, p?.phone, [p?.city, p?.state].filter(Boolean).join(', '), p?.linkedin, p?.github].filter(Boolean).join('   •   ');
  return (
    <Document>
      <Page size="A4" style={styles12.page}>
        <View style={styles12.header}>
          <Text style={styles12.name}>{p?.first_name} {p?.last_name}</Text>
          {p?.professional_title && <Text style={styles12.title}>{p.professional_title}</Text>}
          {contact && <Text style={styles12.contact}>{contact}</Text>}
        </View>

        {(p?.summary || (data as any).summary) && (
          <View style={styles12.section}>
            <Text style={styles12.sectionTitle}>Profile Summary</Text>
            <Text style={styles12.text}>{p?.summary || (data as any).summary}</Text>
          </View>
        )}

        {data.experience && data.experience.length > 0 && (
          <View style={styles12.section}>
            <Text style={styles12.sectionTitle}>Work Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 5 }}>
                <View style={styles12.row}>
                  <Text style={styles12.jobTitle}>{exp.job_title} <Text style={styles12.company}>| {exp.company}</Text></Text>
                  <Text style={styles12.date}>{exp.start_date} – {exp.end_date || (exp.current ? 'Present' : '')}</Text>
                </View>
                {exp.description ? <Text style={styles12.text}>{exp.description}</Text> : null}
                {exp.achievements?.map((ach, j) => (
                  <View key={j} style={styles12.bullet}>
                    <Text style={styles12.bulletDot}>○</Text>
                    <Text style={styles12.bulletText}>{ach}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.education && data.education.length > 0 && (
          <View style={styles12.section}>
            <Text style={styles12.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <View style={styles12.row}>
                  <Text style={styles12.jobTitle}>{edu.degree} <Text style={styles12.company}>| {edu.institution}</Text></Text>
                  <Text style={styles12.date}>{edu.start_date} – {edu.end_date}</Text>
                </View>
                <Text style={styles12.text}>
                  {[edu.location, edu.gpa ? `GPA: ${edu.gpa}` : null, edu.relevant_coursework?.join(', ')].filter(Boolean).join(' • ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {data.skills && data.skills.length > 0 && (
          <View style={styles12.section}>
            <Text style={styles12.sectionTitle}>Technical Skills</Text>
            {data.skills.map((s, i) => (
              <View key={i} style={styles12.skillRow}>
                <Text style={styles12.skillCategory}>{s.category}:</Text>
                <Text style={styles12.skillItems}>{Array.isArray(s.items) ? s.items.join(', ') : s.items}</Text>
              </View>
            ))}
          </View>
        )}

        {data.projects && data.projects.length > 0 && (
          <View style={styles12.section}>
            <Text style={styles12.sectionTitle}>Key Projects</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={{ marginBottom: 3 }}>
                <View style={styles12.row}>
                  <Text style={styles12.jobTitle}>{proj.name}</Text>
                </View>
                <Text style={styles12.text}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
export default Template12;
