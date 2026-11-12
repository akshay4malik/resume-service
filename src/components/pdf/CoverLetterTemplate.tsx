import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 72, // 1 inch margin
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#222222',
    lineHeight: 1.5,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    textTransform: 'uppercase',
  },
  body: {
    marginBottom: 24,
  },
  paragraph: {
    marginBottom: 12,
    textAlign: 'justify',
  },
  signature: {
    marginTop: 20,
  },
  name: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  email: {
    color: '#555555',
  },
});

interface CoverLetterTemplateProps {
  candidateName: string;
  candidateEmail: string;
  body: string;
}

export const CoverLetterTemplate: React.FC<CoverLetterTemplateProps> = ({
  candidateName,
  candidateEmail,
  body,
}) => {
  const paragraphs = body.split('\n\n').filter(p => p.trim().length > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>COVER LETTER</Text>
        </View>

        <View style={styles.body}>
          {paragraphs.map((p, idx) => (
            <Text key={idx} style={styles.paragraph}>
              {p.trim()}
            </Text>
          ))}
        </View>

        <View style={styles.signature}>
          <Text style={styles.name}>{candidateName}</Text>
          <Text style={styles.email}>{candidateEmail}</Text>
        </View>
      </Page>
    </Document>
  );
};
export default CoverLetterTemplate;

