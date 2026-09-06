import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme/theme';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { createShare } from '../lib/db';

const DURATIONS = [
  { key: '24h', label: '24-hour access' },
  { key: '7d', label: '7-day access' },
  { key: 'until_revoked', label: 'Until revoked' },
];

export default function ShareRecordsScreen({ navigation, route }) {
  const { user } = useAuth();
  const [recipientName, setRecipientName] = useState('');
  const [recipientType, setRecipientType] = useState('Doctor');
  const [scope, setScope] = useState(route.params?.presetScope || '');
  const [duration, setDuration] = useState('24h');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const share = async () => {
    if (!recipientName || !scope) {
      Alert.alert('A few details are missing', 'Add who you\u2019re sharing with and what to share.');
      return;
    }
    setSaving(true);
    try {
      await createShare(user.id, { recipient_name: recipientName, recipient_type: recipientType, scope, duration });
      setDone(true);
    } catch (e) {
      Alert.alert('Could not share record', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <ScreenHeader title="Share Records" onBack={() => navigation.goBack()} />
        <View style={styles.confirmWrap}>
          <View style={styles.confirmIcon}>
            <Ionicons name="checkmark" size={28} color={colors.white} />
          </View>
          <Text style={styles.confirmTitle}>Access granted</Text>
          <Text style={styles.confirmBody}>
            {recipientName} can now see: {scope}. Access {duration === 'until_revoked' ? 'stays active until you revoke it' : `expires in ${duration === '24h' ? '24 hours' : '7 days'}`}.
          </Text>
          <Button title="View access log" onPress={() => navigation.replace('AccessLog')} style={{ marginTop: spacing.xl }} />
          <Button title="Done" variant="secondary" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScreenHeader title="Share Records" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Field label="Recipient name" placeholder="e.g. Dr. Amaka Nwosu" value={recipientName} onChangeText={setRecipientName} />

        <Text style={styles.label}>Recipient type</Text>
        <View style={styles.chipRow}>
          {['Doctor', 'Hospital', 'Lab', 'Other'].map((t) => (
            <Pressable key={t} onPress={() => setRecipientType(t)} style={[styles.chip, recipientType === t && styles.chipActive]}>
              <Text style={[styles.chipText, recipientType === t && styles.chipTextActive]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        <Field label="What to share" placeholder="e.g. Medical history, medications, latest labs" value={scope} onChangeText={setScope} multiline />

        <Text style={styles.label}>Access duration</Text>
        {DURATIONS.map((d) => (
          <Pressable key={d.key} onPress={() => setDuration(d.key)} style={styles.durationRow}>
            <View style={[styles.radio, duration === d.key && styles.radioActive]}>
              {duration === d.key && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.durationLabel}>{d.label}</Text>
          </Pressable>
        ))}

        <Text style={styles.helper}>You'll be able to see exactly who accessed this and revoke it any time from the Access Log.</Text>

        <Button title="Grant access" onPress={share} loading={saving} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </View>
  );
}

function Field({ label, ...rest }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, rest.multiline && { height: 70, textAlignVertical: 'top' }]} placeholderTextColor={colors.textMuted} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  label: { ...typography.small_medium, color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg,
    paddingVertical: 14, ...typography.body, color: colors.textPrimary, backgroundColor: colors.surfaceMuted,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: { paddingVertical: 8, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { ...typography.small_medium, color: colors.textSecondary },
  chipTextActive: { color: colors.primary },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  durationLabel: { ...typography.body, color: colors.textPrimary },
  helper: { ...typography.tiny, color: colors.textMuted, marginTop: spacing.lg },
  confirmWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  confirmIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  confirmTitle: { ...typography.h1, color: colors.textPrimary },
  confirmBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});
