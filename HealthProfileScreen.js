import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/theme';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function HealthProfileScreen({ navigation }) {
  const { profile, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    date_of_birth: profile?.date_of_birth || '',
    blood_group: profile?.blood_group || '',
    allergies: profile?.allergies || '',
    major_conditions: profile?.major_conditions || '',
    emergency_contact_name: profile?.emergency_contact_name || '',
    emergency_contact_phone: profile?.emergency_contact_phone || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Health Profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Field label="Full name" value={form.full_name} onChangeText={set('full_name')} />
        <Field label="Date of birth" placeholder="DD/MM/YYYY" value={form.date_of_birth} onChangeText={set('date_of_birth')} />
        <Field label="Blood group" placeholder="e.g. O+" value={form.blood_group} onChangeText={set('blood_group')} />
        <Field label="Allergies" value={form.allergies} onChangeText={set('allergies')} multiline />
        <Field label="Major medical conditions" value={form.major_conditions} onChangeText={set('major_conditions')} multiline />
        <Field label="Emergency contact name" value={form.emergency_contact_name} onChangeText={set('emergency_contact_name')} />
        <Field label="Emergency contact phone" value={form.emergency_contact_phone} onChangeText={set('emergency_contact_phone')} keyboardType="phone-pad" />

        <Button title="Save changes" onPress={save} loading={saving} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, ...rest }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, rest.multiline && { height: 80, textAlignVertical: 'top' }]}
        placeholderTextColor={colors.textMuted}
        {...rest}
      />
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
});
