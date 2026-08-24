import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ResumeDraft } from "@/lib/validations/resume-builder";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  contactLine: { fontSize: 9, color: "#555555", marginBottom: 14 },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: "1 solid #cccccc",
    paddingBottom: 3,
  },
  summaryText: { lineHeight: 1.4 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap" },
  skillChip: {
    fontSize: 9,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  entry: { marginBottom: 10 },
  entryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  entryTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  entryDates: { fontSize: 9, color: "#555555" },
  entrySubtitle: { fontSize: 9.5, color: "#333333", marginBottom: 3 },
  bullet: { flexDirection: "row", marginBottom: 2 },
  bulletMarker: { width: 10 },
  bulletText: { flex: 1, lineHeight: 1.35 },
});

function ResumeDocument({ draft }: { draft: ResumeDraft }) {
  const contactLine = [draft.email, draft.phone, draft.location].filter(Boolean).join("  ·  ");

  return (
    <Document title={draft.fullName ? `${draft.fullName} - Resume` : "Resume"}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{draft.fullName || "Untitled"}</Text>
        {contactLine ? <Text style={styles.contactLine}>{contactLine}</Text> : null}

        {draft.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{draft.summary}</Text>
          </View>
        ) : null}

        {draft.skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsRow}>
              {draft.skills.map((skill, index) => (
                <Text key={`${skill}-${index}`} style={styles.skillChip}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {draft.experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {draft.experience.map((entry, index) => (
              <View key={index} style={styles.entry}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  <Text style={styles.entryDates}>{entry.dates}</Text>
                </View>
                <Text style={styles.entrySubtitle}>{entry.company}</Text>
                {entry.bullets.map((bullet, bulletIndex) => (
                  <View key={bulletIndex} style={styles.bullet}>
                    <Text style={styles.bulletMarker}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {draft.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {draft.education.map((entry, index) => (
              <View key={index} style={styles.entry}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryTitle}>{entry.school}</Text>
                  <Text style={styles.entryDates}>{entry.dates}</Text>
                </View>
                <Text style={styles.entrySubtitle}>{entry.degree}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

/** Renders a resume draft to PDF bytes, ready to hand to saveResumeBytes. */
export async function renderResumePdf(draft: ResumeDraft): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument draft={draft} />);
}
