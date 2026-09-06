import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme/theme';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { sendChatMessage, isClaudeConfigured } from '../lib/claude';

export default function RecordDetailsScreen({ route, navigation }) {
  const { record } = route.params;
  const [summary, setSummary] = useState(record.ai_summary || null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const prompt = `Explain this medical record entry to the patient in 2-3 plain-language sentences. Title: "${record.title}". Category: ${record.category}. Facility: ${record.facility || 'unknown'}. Notes: ${record.notes || 'none'}.`;
      const text = await sendChatMessage([{ role: 'user', content: prompt }]);
      setSummary(text);
    } catch (e) {
      setSummary('AI summary is unavailable right now (' + e.message + ').');
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScreenHeader title="Record" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{record.title}</Text>
        <Text style={styles.meta}>{record.category} · {record.record_date || 'No date'}</Text>
        <Text style={styles.meta}>{record.facility || 'No facility noted'}</Text>

        {record.file_url ? (
          <Image source={{ uri: record.file_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="document-text-outline" size={32} color={colors.textMuted} />
            <Text style={styles.placeholderText}>No document attached</Text>
          </View>
        )}

        {record.notes ? (
          <Card style={{ marginTop: spacing.lg }}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.body}>{record.notes}</Text>
          </Card>
        ) : null}

        <Card style={{ marginTop: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { marginLeft: spacing.xs, marginBottom: 0 }]}>AI summary</Text>
          </View>
          {summary ? (
            <Text style={styles.body}>{summary}</Text>
          ) : (
            <Text style={styles.mutedBody}>Get a plain-language explanation of this record.</Text>
          )}
          <Button
            title={summary ? 'Regenerate summary' : 'Summarise with MyHealth AI'}
            variant="outline"
            onPress={generateSummary}
            loading={loadingSummary}
            style={{ marginTop: spacing.md }}
          />
          {!isClaudeConfigured && (
            <Text style={styles.warnText}>Add ANTHROPIC_API_KEY to .env to enable this.</Text>
          )}
          <Text style={styles.disclaimer}>Informational only — not a medical diagnosis.</Text>
        </Card>

        <Button
          title="Share this record"
          onPress={() => navigation.navigate('ShareRecords', { presetScope: record.title })}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  title: { ...typography.h1, color: colors.textPrimary },
  meta: { ...typography.small, color: colors.textSecondary, marginTop: 4 },
  image: { width: '100%', height: 220, borderRadius: radius.md, marginTop: spacing.lg, backgroundColor: colors.surfaceMuted },
  placeholderImage: {
    height: 160, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, marginTop: spacing.lg,
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
  },
  placeholderText: { ...typography.small, color: colors.textMuted },
  sectionTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textPrimary, lineHeight: 21 },
  mutedBody: { ...typography.body, color: colors.textSecondary },
  warnText: { ...typography.tiny, color: colors.warning, marginTop: spacing.sm },
  disclaimer: { ...typography.tiny, color: colors.textMuted, marginTop: spacing.sm },
});
