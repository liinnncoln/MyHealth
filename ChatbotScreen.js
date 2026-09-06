import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme/theme';
import ScreenHeader from '../components/ScreenHeader';
import { sendChatMessage, isClaudeConfigured } from '../lib/claude';

const SUGGESTIONS = [
  'What does "LDL cholesterol" mean?',
  'Explain my blood pressure reading',
  'What should I ask my doctor at my next visit?',
];

export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi, I'm MyHealth AI. Ask me about a medication, a term on one of your records, or general health questions. I can't diagnose or replace your doctor, but I can help you understand things.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const reply = await sendChatMessage(nextMessages);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: `I couldn't respond just now — ${e.message}` }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <ScreenHeader title="MyHealth AI" subtitle="Informational, not a diagnosis" onBack={() => navigation.goBack()} />

      {!isClaudeConfigured && (
        <View style={styles.configNotice}>
          <Ionicons name="information-circle" size={16} color={colors.warning} />
          <Text style={styles.configNoticeText}>
            Add ANTHROPIC_API_KEY to your .env file to enable real AI responses. See README.md.
          </Text>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.md }}
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, item.role === 'user' && styles.bubbleRowUser]}>
            <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
              <Text style={[styles.bubbleText, item.role === 'user' && { color: colors.white }]}>{item.content}</Text>
            </View>
          </View>
        )}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {messages.length < 2 && (
        <View style={styles.suggestionsRow}>
          {SUGGESTIONS.map((s) => (
            <Pressable key={s} style={styles.suggestionChip} onPress={() => send(s)}>
              <Text style={styles.suggestionText}>{s}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask MyHealth AI..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <Pressable style={styles.sendBtn} onPress={() => send()} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.white} size="small" /> : <Ionicons name="arrow-up" size={18} color={colors.white} />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  configNotice: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.warningSoft, marginHorizontal: spacing.lg, padding: spacing.md, borderRadius: radius.md },
  configNoticeText: { ...typography.small, color: colors.warning, flex: 1 },
  bubbleRow: { marginBottom: spacing.md, alignItems: 'flex-start' },
  bubbleRowUser: { alignItems: 'flex-end' },
  bubble: { maxWidth: '82%', paddingVertical: 10, paddingHorizontal: spacing.md, borderRadius: radius.md },
  bubbleAssistant: { backgroundColor: colors.surfaceMuted, borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { ...typography.body, color: colors.textPrimary, lineHeight: 20 },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  suggestionChip: { paddingVertical: 8, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  suggestionText: { ...typography.small_medium, color: colors.primary },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, padding: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: spacing.lg,
    paddingVertical: 12, ...typography.body, color: colors.textPrimary, backgroundColor: colors.surfaceMuted, maxHeight: 100,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
