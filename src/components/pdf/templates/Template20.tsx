import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '@/lib/schemas/resume';

// Template 20: Classic Two-Column (Teal & Slate balanced: Sidebar 30%, Main 70%)
const styles20 = StyleSheet.create({
  page: { flexDirection: 'row', backgroundColor: '#FFFFFF', fontSize: 8.5, fontFamily: 'Helvetica', color: '#1e293b' },
  sidebar: { width: '31%', backgroundColor: '#f8fafc', paddingHorizontal: 16, paddingTop: 28, paddingBottom: 24, borderRightWidth: 1, borderRightColor: '#e2e8f0' },
  main: { width: '69%', paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 },
  name: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 5, lineHeight: 1.2 },
  title: { fontSize: 9.5, color: '#0f766e', marginBottom: 12, fontFamily: 'Helvetica-Bold', lineHeight: 1.2 },
  sidebarSection: { marginBottom: 10 },
  sidebarTitle: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#0f766e', textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 1.5, marginBottom: 4 },
  mainSection: { marginBottom: 8 },
  mainSectionTitle: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#0f766e', textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 2, marginBottom: 4 },
  contactItem: { fontSize: 8, color: '#475569', marginBottom: 2.5, lineHeight: 1.2 },
  jobRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 1 },
  jobTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#0f172a' },
  company: { fontSize: 8.5, color: '#0f766e', marginBottom: 1 },
  date: { fontSize: 7.5, color: '#64748b' },
  bullet: { flexDirection: 'row', marginTop: 1.5, paddingLeft: 4, marginBottom: 1 },
  bulletDot: { width: 5, fontSize: 8, color: '#0f766e' },
  bulletText: { flex: 1, fontSize: 8, color: '#334155', lineHeight: 1.28 },
  text: { fontSize: 8, color: '#334155', lineHeight: 1.28 },
});

export const Template20: React.FC<{ data: ResumeData }> = ({ data }) => {
  const p = data.personal_info;
  return (
    <Document>
      <Page size="A4" style={styles20.page}>
        {/* Left Sidebar */}
        <View style={styles20.sidebar}>
          <Text style={styles20.name}>{p?.first_name} {p?.last_name}</Text>
          {p?.professional_title && <Text style={styles20.title}>{p.professional_title}</Text>}

          <View style={styles20.sidebarSection}>
            <Text style={styles20.sidebarTitle}>Contact</Text>
            {p?.email && <Text style={styles20.contactItem}>{p.email}</Text>}
            {p?.phone && <Text style={styles20.contactItem}>{p.phone}</Text>}
            {p?.city && <Text style={styles20.contactItem}>{[p.city, p.country || p.state].filter(Boolean).join(', ')}</Text>}
            {p?.linkedin && <Text style={styles20.contactItem}>{p.linkedin}</Text>}
            {p?.github && <Text style={styles20.contactItem}>{p.github}</Text>}
          </View>

          {data.skills && data.skills.length > 0 && (
            <View style={styles20.sidebarSection}>
              <Text style={styles20.sidebarTitle}>Skills</Text>
              {data.skills.map((s, i) => (
                <View key={i} style={{ marginBottom: 3 }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#0f172a' }}>{s.category}</Text>
                  <Text style={styles20.text}>{Array.isArray(s.items) ? s.items.join(', ') : s.items}</Text>
                </View>
              ))}
            </View>
          )}

          {data.education && data.education.length > 0 && (
            <View style={styles20.sidebarSection}>
              <Text style={styles20.sidebarTitle}>Education</Text>
              {data.education.map((edu, i) => (
                <View key={i} style={{ marginBottom: 3 }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#0f172a' }}>{edu.degree}</Text>
                  <Text style={styles20.text}>{edu.institution}</Text>
                  <Text style={styles20.date}>{edu.start_date} – {edu.end_date}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main Content Area */}
        <View style={styles20.main}>
          {(p?.summary || (data as any).summary) && (
            <View style={styles20.mainSection}>
              <Text style={styles20.mainSectionTitle}>About Me</Text>
              <Text style={styles20.text}>{p?.summary || (data as any).summary}</Text>
            </View>
          )}

          {data.experience && data.experience.length > 0 && (
            <View style={styles20.mainSection}>
              <Text style={styles20.mainSectionTitle}>Experience</Text>
              {data.experience.map((exp, i) => (
                <View key={i} style={{ marginBottom: 5 }}>
                  <View style={styles20.jobRow}>
                    <Text style={styles20.jobTitle}>{exp.job_title}</Text>
                    <Text style={styles20.date}>{exp.start_date} – {exp.end_date || 'Present'}</Text>
                  </View>
                  <Text style={styles20.company}>{exp.company} {exp.location ? `| ${exp.location}` : ''}</Text>
                  {exp.description ? <Text style={styles20.text}>{exp.description}</Text> : null}
                  {exp.achievements?.map((ach, j) => (
                    <View key={j} style={styles20.bullet}>
                      <Text style={styles20.bulletDot}>•</Text>
                      <Text style={styles20.bulletText}>{ach}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {data.projects && data.projects.length > 0 && (
            <View style={styles20.mainSection}>
              <Text style={styles20.mainSectionTitle}>Projects</Text>
              {data.projects.map((proj, i) => (
                <View key={i} style={{ marginBottom: 3 }}>
                  <Text style={styles20.jobTitle}>{proj.name}</Text>
                  <Text style={styles20.text}>{proj.description}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
export default Template20;
