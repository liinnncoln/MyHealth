import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius, typography } from '../theme/theme';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { createRecord, uploadRecordFile } from '../lib/db';

const CATEGORIES = ['Tests', 'Diagnoses', 'Medications', 'Imaging', 'Other'];

export default function AddRecordScreen({ navigation }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tests');
  const [facility, setFacility] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [asset, setAsset] = useState(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async (fromCamera) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'MyHealth needs access to continue.');
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) setAsset(result.assets[0]);
  };

  const handleSave = async () => {
    if (!title) {
      Alert.alert('Add a title', 'Give this record a short, recognisable name.');
      return;
    }
    setSaving(true);
    try {
      let fileUrl = null;
      if (asset) {
        try {
          fileUrl = await uploadRecordFile(user.id, asset.uri, asset.fileName || 'record.jpg');
        } catch (e) {
          // Upload can fail if storage bucket isn't set up yet — record still saves without the file.
        }
      }
      await createRecord(user.id, {
        title,
        category,
        facility: facility || null,
        record_date: date || null,
        notes: notes || null,
        file_url: fileUrl,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not save record', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScreenHeader title="Add Record" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.captureRow}>
          <Pressable style={styles.captureBtn} onPress={() => pickImage(true)}>
            <Ionicons name="camera" size={22} color={colors.primary} />
            <Text style={styles.captureLabel}>Take a photo</Text>
          </Pressable>
          <Pressable style={styles.captureBtn} onPress={() => pickImage(false)}>
            <Ionicons name="cloud-upload" size={22} color={colors.primary} />
            <Text style={styles.captureLabel}>Upload document</Text>
          </Pressable>
        </View>
        {asset && (
          <View style={styles.attachedRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.attachedText}>1 file attached</Text>
          </View>
        )}

        <Field label="Title" placeholder="e.g. Full Blood Count — Jan 2026" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipActive]}>
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <Field label="Date" placeholder="DD/MM/YYYY" value={date} onChangeText={setDate} />
        <Field label="Healthcare facility / source" placeholder="e.g. Reddington Hospital" value={facility} onChangeText={setFacility} />
        <Field label="Notes (optional)" placeholder="Anything worth remembering" value={notes} onChangeText={setNotes} multiline />

        <Button title="Save record" onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </View>
  );
}

function Field({ label, ...rest }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, rest.multiline && { height: 90, textAlignVertical: 'top' }]} placeholderTextColor={colors.textMuted} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  captureRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  captureBtn: {
    flex: 1, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.md,
    paddingVertical: spacing.lg, alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceMuted,
  },
  captureLabel: { ...typography.small_medium, color: colors.textPrimary },
  attachedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  attachedText: { ...typography.small, color: colors.success },
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
});
