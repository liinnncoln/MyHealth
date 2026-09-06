import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme/theme';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { profile, user, signOut } = useAuth();

  const items = [
    { icon: 'person-outline', label: 'Personal information', onPress: () => navigation.navigate('HealthProfile') },
    { icon: 'qr-code-outline', label: 'Emergency profile', onPress: () => navigation.navigate('EmergencyProfile') },
    { icon: 'people-outline', label: 'Family and caregivers', onPress: () => navigation.navigate('Family') },
    { icon: 'share-social-outline', label: 'Who can access my records', onPress: () => navigation.navigate('ShareRecords') },
    { icon: 'time-outline', label: 'Access history', onPress: () => navigation.navigate('AccessLog') },
    { icon: 'sparkles-outline', label: 'MyHealth AI', onPress: () => navigation.navigate('Chatbot') },
    { icon: 'shield-checkmark-outline', label: 'Security', onPress: () => Alert.alert('Security', 'Two-factor authentication and biometrics are planned for a future release.') },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => Alert.alert('Notifications', 'Notification preferences are coming soon.') },
    { icon: 'help-circle-outline', label: 'Help and support', onPress: () => Alert.alert('Help', 'Reach us at support@myhealth.app') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(profile?.full_name || user?.email || '?')[0]?.toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.name}>{profile?.full_name || 'Your profile'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 0 }}>
        <Card padded={false}>
          {items.map((item, i) => (
            <Pressable key={item.label} onPress={item.onPress} style={[styles.row, i < items.length - 1 && styles.rowBorder]}>
              <Ionicons name={item.icon} size={20} color={colors.textSecondary} />
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </Card>

        <Pressable style={styles.logoutRow} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.h1, color: colors.primary },
  name: { ...typography.h1, color: colors.textPrimary },
  email: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { flex: 1, ...typography.body, color: colors.textPrimary },
  logoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xl, paddingVertical: spacing.md },
  logoutText: { ...typography.bodyMedium, color: colors.danger },
});
