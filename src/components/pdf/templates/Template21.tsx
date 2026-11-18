import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '@/lib/schemas/resume';

// Template 21: Analyst Professional (Consulting standard, McKinsey/Bain clean structure, crisp dividers)
const styles21 = StyleSheet.create({
  page: { paddingHorizontal: 38, paddingTop: 32, paddingBottom: 32, fontSize: 9, fontFamily: 'Helvetica', color: '#111827', lineHeight: 1.34 },
  header: { marginBottom: 10, borderBottomWidth: 1.5, borderBottomColor: '#1e293b', paddingBottom: 8 },
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 6, lineHeight: 1.2 },
  title: { fontSize: 10.5, color: '#334155', marginBottom: 6, fontFamily: 'Helvetica-Bold', lineHeight: 1.2 },
  contact: { fontSize: 8.5, color: '#64748b', lineHeight: 1.2 },
  section: { marginTop: 8, marginBottom: 2 },
  sectionTitle: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#0f172a', textTransform: 'uppercase', borderBottomWidth: 0.8, borderBottomColor: '#cbd5e1', paddingBottom: 1.5, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 1.5 },
  jobTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#0f172a' },
  company: { fontSize: 9, color: '#334155' },
  date: { fontSize: 8, color: '#64748b' },
  bullet: { flexDirection: 'row', marginTop: 1.5, paddingLeft: 6, marginBottom: 1.5 },
  bulletDot: { width: 7, fontSize: 8, color: '#334155' },
  bulletText: { flex: 1, fontSize: 8.5, color: '#334155', lineHeight: 1.3 },
  text: { fontSize: 8.5, color: '#334155', lineHeight: 1.34 },
  skillRow: { flexDirection: 'row', marginBottom: 2, fontSize: 8.5, lineHeight: 1.25 },
});

export const Template21: React.FC<{ data: ResumeData }> = ({ data }) => {
  const p = data.personal_info;
  const contact = [p?.email, p?.phone, [p?.city, p?.state].filter(Boolean).join(', '), p?.linkedin, p?.github].filter(Boolean).join('   |   ');
  return (
    <Document>
      <Page size="A4" style={styles21.page}>
        <View style={styles21.header}>
          <Text style={styles21.name}>{p?.first_name} {p?.last_name}</Text>
          {p?.professional_title && <Text style={styles21.title}>{p.professional_title}</Text>}
          {contact && <Text style={styles21.contact}>{contact}</Text>}
        </View>

        {(p?.summary || (data as any).summary) && (
          <View style={styles21.section}>
            <Text style={styles21.sectionTitle}>Executive Profile</Text>
            <Text style={styles21.text}>{p?.summary || (data as any).summary}</Text>
          </View>
        )}

        {data.experience && data.experience.length > 0 && (
          <View style={styles21.section}>
            <Text style={styles21.sectionTitle}>Experience & Impact</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 5 }}>
                <View style={styles21.row}>
                  <Text style={styles21.jobTitle}>{exp.job_title} <Text style={styles21.company}>| {exp.company}</Text></Text>
                  <Text style={styles21.date}>{exp.start_date} – {exp.end_date || 'Present'}</Text>
                </View>
                {exp.description ? <Text style={styles21.text}>{exp.description}</Text> : null}
                {exp.achievements?.map((ach, j) => (
                  <View key={j} style={styles21.bullet}>
                    <Text style={styles21.bulletDot}>•</Text>
                    <Text style={styles21.bulletText}>{ach}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.education && data.education.length > 0 && (
          <View style={styles21.section}>
            <Text style={styles21.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <View style={styles21.row}>
                  <Text style={styles21.jobTitle}>{edu.degree} <Text style={styles21.company}>- {edu.institution}</Text></Text>
                  <Text style={styles21.date}>{edu.start_date} – {edu.end_date}</Text>
                </View>
                <Text style={styles21.text}>
                  {[edu.location, edu.gpa ? `Grade / Honors: ${edu.gpa}` : null, edu.relevant_coursework?.join(', ')].filter(Boolean).join(' • ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {data.skills && data.skills.length > 0 && (
          <View style={styles21.section}>
            <Text style={styles21.sectionTitle}>Core Competencies</Text>
            {data.skills.map((s, i) => (
              <View key={i} style={styles21.skillRow}>
                <Text style={{ fontFamily: 'Helvetica-Bold', width: 140 }}>{s.category}: </Text>
                <Text style={{ flex: 1, color: '#334155' }}>{Array.isArray(s.items) ? s.items.join(', ') : s.items}</Text>
              </View>
            ))}
          </View>
        )}

        {data.projects && data.projects.length > 0 && (
          <View style={styles21.section}>
            <Text style={styles21.sectionTitle}>Key Projects</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={{ marginBottom: 3 }}>
                <View style={styles21.row}>
                  <Text style={styles21.jobTitle}>{proj.name}</Text>
                </View>
                <Text style={styles21.text}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
export default Template21;
