import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '@/lib/schemas/resume';

// Template 15: Academic CV (Premium Serif, balanced margins, slate charcoal)
const styles15 = StyleSheet.create({
  page: { paddingHorizontal: 40, paddingTop: 34, paddingBottom: 34, fontSize: 9, fontFamily: 'Times-Roman', color: '#1e293b', lineHeight: 1.34 },
  header: { textAlign: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 8 },
  name: { fontSize: 22, fontFamily: 'Times-Bold', color: '#0f172a', marginBottom: 6, lineHeight: 1.2 },
  title: { fontSize: 10.5, fontFamily: 'Times-Bold', color: '#334155', marginBottom: 6, lineHeight: 1.2 },
  contact: { fontSize: 8.5, color: '#475569', lineHeight: 1.2 },
  section: { marginTop: 8, marginBottom: 2 },
  sectionTitle: { fontSize: 10, fontFamily: 'Times-Bold', color: '#0f172a', borderBottomWidth: 0.8, borderBottomColor: '#cbd5e1', paddingBottom: 2, marginBottom: 4, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 1.5 },
  bold: { fontFamily: 'Times-Bold', color: '#0f172a' },
  italic: { fontFamily: 'Times-Italic', color: '#334155' },
  date: { fontSize: 8, color: '#64748b', fontFamily: 'Times-Roman' },
  text: { fontSize: 8.5, color: '#334155', lineHeight: 1.34 },
  bullet: { flexDirection: 'row', marginTop: 1.5, paddingLeft: 6, marginBottom: 1.5 },
  bulletDot: { width: 7, fontSize: 8, color: '#475569' },
  bulletText: { flex: 1, fontSize: 8.5, color: '#334155', lineHeight: 1.3 },
  skillRow: { flexDirection: 'row', marginBottom: 2, fontSize: 8.5, lineHeight: 1.25 },
});

export const Template15: React.FC<{ data: ResumeData }> = ({ data }) => {
  const p = data.personal_info;
  const contact = [p?.email, p?.phone, [p?.city, p?.state].filter(Boolean).join(', '), p?.linkedin, p?.github].filter(Boolean).join('   •   ');
  return (
    <Document>
      <Page size="A4" style={styles15.page}>
        <View style={styles15.header}>
          <Text style={styles15.name}>{p?.first_name} {p?.last_name}</Text>
          {p?.professional_title && <Text style={styles15.title}>{p.professional_title}</Text>}
          {contact && <Text style={styles15.contact}>{contact}</Text>}
        </View>

        {(p?.summary || (data as any).summary) && (
          <View style={styles15.section}>
            <Text style={styles15.sectionTitle}>Curriculum Summary</Text>
            <Text style={styles15.text}>{p?.summary || (data as any).summary}</Text>
          </View>
        )}

        {data.education && data.education.length > 0 && (
          <View style={styles15.section}>
            <Text style={styles15.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <View style={styles15.row}>
                  <Text style={styles15.bold}>{edu.degree}, <Text style={styles15.italic}>{edu.institution}</Text></Text>
                  <Text style={styles15.date}>{edu.start_date} – {edu.end_date}</Text>
                </View>
                <Text style={styles15.text}>
                  {[edu.location, edu.gpa ? `GPA: ${edu.gpa}` : null, edu.relevant_coursework?.join(', ')].filter(Boolean).join(' • ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {data.experience && data.experience.length > 0 && (
          <View style={styles15.section}>
            <Text style={styles15.sectionTitle}>Academic & Professional Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 5 }}>
                <View style={styles15.row}>
                  <Text style={styles15.bold}>{exp.job_title}, <Text style={styles15.italic}>{exp.company}</Text></Text>
                  <Text style={styles15.date}>{exp.start_date} – {exp.end_date || 'Present'}</Text>
                </View>
                {exp.description ? <Text style={styles15.text}>{exp.description}</Text> : null}
                {exp.achievements?.map((ach, j) => (
                  <View key={j} style={styles15.bullet}>
                    <Text style={styles15.bulletDot}>•</Text>
                    <Text style={styles15.bulletText}>{ach}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {data.skills && data.skills.length > 0 && (
          <View style={styles15.section}>
            <Text style={styles15.sectionTitle}>Technical & Research Competencies</Text>
            {data.skills.map((s, i) => (
              <View key={i} style={styles15.skillRow}>
                <Text style={[styles15.text, styles15.bold, { width: 140 }]}>{s.category}:</Text>
                <Text style={[styles15.text, { flex: 1 }]}>{Array.isArray(s.items) ? s.items.join(', ') : s.items}</Text>
              </View>
            ))}
          </View>
        )}

        {data.projects && data.projects.length > 0 && (
          <View style={styles15.section}>
            <Text style={styles15.sectionTitle}>Selected Research & Systems</Text>
            {data.projects.map((proj, i) => (
              <View key={i} style={{ marginBottom: 3 }}>
                <View style={styles15.row}>
                  <Text style={styles15.bold}>{proj.name}</Text>
                </View>
                <Text style={styles15.text}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}

        {data.awards && data.awards.length > 0 && (
          <View style={styles15.section}>
            <Text style={styles15.sectionTitle}>Honors & Awards</Text>
            {data.awards.map((aw, i) => (
              <View key={i} style={[styles15.row, { marginBottom: 1.5 }]}>
                <Text style={styles15.text}><Text style={styles15.bold}>{aw.title}</Text>, {aw.organization}</Text>
                <Text style={styles15.date}>{aw.year}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
export default Template15;
