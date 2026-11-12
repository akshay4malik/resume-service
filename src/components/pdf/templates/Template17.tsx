import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '@/lib/schemas/resume';

// Template 17: Tech Startup (Refined Indigo/Electric Blue #2563EB)
const styles17 = StyleSheet.create({
  page: { paddingHorizontal: 38, paddingTop: 32, paddingBottom: 32, fontSize: 9, fontFamily: 'Helvetica', color: '#1e293b', lineHeight: 1.34 },
  header: { borderBottomWidth: 1.5, borderBottomColor: '#2563eb', paddingBottom: 8, marginBottom: 10 },
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 6, lineHeight: 1.2 },
  title: { fontSize: 10.5, color: '#2563eb', marginBottom: 6, fontFamily: 'Helvetica-Bold', lineHeight: 1.2 },
  contact: { fontSize: 8.5, color: '#64748b', lineHeight: 1.2 },
  section: { marginTop: 8, marginBottom: 2 },
  sectionTitle: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#2563eb', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1.5 },
  jobTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#0f172a' },
  company: { color: '#2563eb', fontSize: 9 },
  date: { fontSize: 8, color: '#64748b' },
  bullet: { flexDirection: 'row', marginTop: 1.5, paddingLeft: 6, marginBottom: 1.5 },
  bulletDot: { width: 7, fontSize: 8, color: '#2563eb' },
  bulletText: { flex: 1, fontSize: 8.5, color: '#334155', lineHeight: 1.3 },
  text: { fontSize: 8.5, color: '#334155', lineHeight: 1.34 },
  skillRow: { flexDirection: 'row', marginBottom: 2, fontSize: 8.5, lineHeight: 1.25 },
});

export const Template17: React.FC<{ data: ResumeData }> = ({ data }) => {
  const p = data.personal_info;
  const contact = [p?.email, p?.phone, [p?.city, p?.state].filter(Boolean).join(', '), p?.github, p?.linkedin].filter(Boolean).join('   /   ');
  return (
    <Document>
      <Page size="A4" style={styles17.page}>
        <View style={styles17.header}>
          <Text style={styles17.name}>{p?.first_name} {p?.last_name}</Text>
          {p?.professional_title && <Text style={styles17.title}>{p.professional_title}</Text>}
          {contact && <Text style={styles17.contact}>{contact}</Text>}
        </View>

        {(p?.summary || (data as any).summary) && (
          <View style={styles17.section}>
            <Text style={styles17.sectionTitle}>// PROFILE</Text>
            <Text style={styles17.text}>{p?.summary || (data as any).summary}</Text>
          </View>
        )}

        {data.experience && data.experience.length > 0 && (
          <View style={styles17.section}>
            <Text style={styles17.sectionTitle}>// WORK EXPERIENCE</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 5 }}>
                <View style={styles17.row}>
                  <Text style={styles17.jobTitle}>{exp.job_title} <Text style={styles17.company}>@ {exp.company}</Text></Text>
                  <Text style={styles17.date}>{exp.start_date} – {exp.end_date || 'Present'}</Text>
                </View>
                {exp.description ? <Text style={styles17.text}>{exp.description}</Text> : null}
                {exp.achievements?.map((ach, j) => (
                  <View key={j} style={styles17.bullet}>
                    <Text style={styles17.bulletDot}>❯</Text>
                    <Text style={styles17.bulletText}>{ach}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.education && data.education.length > 0 && (
          <View style={styles17.section}>
            <Text style={styles17.sectionTitle}>// EDUCATION</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <View style={styles17.row}>
                  <Text style={styles17.jobTitle}>{edu.degree} - {edu.institution}</Text>
                  <Text style={styles17.date}>{edu.start_date} – {edu.end_date}</Text>
                </View>
                <Text style={styles17.text}>
                  {[edu.location, edu.gpa ? `GPA: ${edu.gpa}` : null, edu.relevant_coursework?.join(', ')].filter(Boolean).join(' • ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {data.skills && data.skills.length > 0 && (
          <View style={styles17.section}>
            <Text style={styles17.sectionTitle}>// TECH STACK</Text>
            {data.skills.map((s, i) => (
              <View key={i} style={styles17.skillRow}>
                <Text style={{ fontFamily: 'Helvetica-Bold', color: '#2563eb', width: 140 }}>{s.category}: </Text>
                <Text style={{ flex: 1, color: '#334155' }}>{Array.isArray(s.items) ? s.items.join(', ') : s.items}</Text>
              </View>
            ))}
          </View>
        )}

        {data.projects && data.projects.length > 0 && (
          <View style={styles17.section}>
            <Text style={styles17.sectionTitle}>// PROJECTS</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={{ marginBottom: 3 }}>
                <View style={styles17.row}>
                  <Text style={styles17.jobTitle}>{proj.name}</Text>
                  <Text style={styles17.date}>{Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}</Text>
                </View>
                <Text style={styles17.text}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
export default Template17;
