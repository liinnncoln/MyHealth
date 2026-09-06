import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme/theme';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const STEPS = ['welcome', 'profile', 'emergency'];

export default function OnboardingScreen() {
  const { updateProfile } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dateOfBirth: '',
    bloodGroup: '',
    allergies: '',
    conditions: '',
    contactName: '',
    contactPhone: '',
  });

  const step = STEPS[stepIndex];
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  const finish = async () => {
    setSaving(true);
    try {
      await updateProfile({
        date_of_birth: form.dateOfBirth || null,
        blood_group: form.bloodGroup || null,
        allergies: form.allergies || null,
        major_conditions: form.conditions || null,
        emergency_contact_name: form.contactName || null,
        emergency_contact_phone: form.contactPhone || null,
        onboarding_complete: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.progressRow}>
          {STEPS.map((s, i) => (
            <View key={s} style={[styles.progressDot, i <= stepIndex && styles.progressDotActive]} />
          ))}
        </View>

        {step === 'welcome' && (
          <View>
            <View style={styles.iconCircle}>
              <Ionicons name="heart" size={28} color={colors.primary} />
            </View>
            <Text style={styles.title}>Welcome to MyHealth</Text>
            <Text style={styles.subtitle}>
              One place to keep your medical history, medications and records — organised, and
              carried with you wherever you go. You control what's saved and who can see it.
            </Text>
            <Button title="Get started" onPress={next} style={{ marginTop: spacing.xl }} />
          </View>
        )}

        {step === 'profile' && (
          <View>
            <Text style={styles.title}>Your basic profile</Text>
            <Text style={styles.subtitle}>Only what's useful to have on hand. You can add more later.</Text>

            <Field label="Date of birth" placeholder="DD/MM/YYYY" value={form.dateOfBirth} onChangeText={set('dateOfBirth')} />
            <Field label="Blood group (if known)" placeholder="e.g. O+" value={form.bloodGroup} onChangeText={set('bloodGroup')} />
            <Field label="Allergies" placeholder="e.g. Penicillin" value={form.allergies} onChangeText={set('allergies')} />
            <Field label="Major medical conditions" placeholder="e.g. Asthma, Hypertension" value={form.conditions} onChangeText={set('conditions')} />

            <View style={styles.rowButtons}>
              <Button title="Back" variant="secondary" onPress={back} fullWidth={false} style={{ flex: 1, marginRight: spacing.sm }} />
              <Button title="Continue" onPress={next} fullWidth={false} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {step === 'emergency' && (
          <View>
            <Text style={styles.title}>Emergency contact</Text>
            <Text style={styles.subtitle}>
              Optional, but recommended — this appears on your Emergency Profile for first
              responders.
            </Text>

            <Field label="Contact name" placeholder="e.g. Chidinma Obi" value={form.contactName} onChangeText={set('contactName')} />
            <Field label="Contact phone" placeholder="e.g. 080..." keyboardType="phone-pad" value={form.contactPhone} onChangeText={set('contactPhone')} />

            <View style={styles.rowButtons}>
              <Button title="Back" variant="secondary" onPress={back} fullWidth={false} style={{ flex: 1, marginRight: spacing.sm }} />
              <Button title="Finish" onPress={finish} loading={saving} fullWidth={false} style={{ flex: 1 }} />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, ...rest }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: spacing.xl, paddingTop: spacing.xxl },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: spacing.xxl },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  progressDotActive: { backgroundColor: colors.primary },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  title: { ...typography.display, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  label: { ...typography.small_medium, color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.lg, paddingVertical: 14, ...typography.body,
    color: colors.textPrimary, backgroundColor: colors.surfaceMuted,
  },
  rowButtons: { flexDirection: 'row', marginTop: spacing.md },
});
