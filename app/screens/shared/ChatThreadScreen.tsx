import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ref, onValue, off } from 'firebase/database';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MessagesStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { rtdb } from '../../utils/firebase';
import { messageService } from '../../services/message.service';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<MessagesStackParamList, 'ChatThread'>;

interface FirebaseMessage {
  _id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

const SAFETY_BANNER = 'Keep all communication on FoodLodge. Never share personal contact details or arrange payments outside the app.';

export function ChatThreadScreen({ route }: Props) {
  const { listingId } = route.params;
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<FirebaseMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const messagesRef = ref(rtdb, `messages/${listingId}`);
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: FirebaseMessage[] = Object.values(data);
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setMessages(list);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    });
    return () => off(messagesRef);
  }, [listingId]);

  async function handleSend() {
    const content = input.trim();
    if (!content) return;
    setInput('');
    setSending(true);
    try {
      await messageService.sendMessage(listingId, content);
    } catch (err: any) {
      Alert.alert('Error', err.message);
      setInput(content);
    } finally {
      setSending(false);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  const isMe = (senderId: string) => senderId === user?._id;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={styles.safetyBanner}>
        <Text style={styles.safetyIcon}>🛡️</Text>
        <Text style={styles.safetyText}>{SAFETY_BANNER}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, i) => item._id || String(i)}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View style={[styles.bubble, isMe(item.senderId) ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.bubbleText, isMe(item.senderId) ? styles.bubbleTextMe : styles.bubbleTextThem]}>
              {item.content}
            </Text>
            <Text style={[styles.bubbleTime, isMe(item.senderId) ? styles.bubbleTimeMe : styles.bubbleTimeThem]}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>No messages yet. Say hello!</Text>
          </View>
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.deepAmber}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream },
  safetyBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.paleLemon, borderBottomWidth: 0.5, borderBottomColor: Colors.amberBorder, padding: 10, gap: 8 },
  safetyIcon: { fontSize: 14, marginTop: 1 },
  safetyText: { flex: 1, fontSize: 11, color: Colors.deepAmber, lineHeight: 16 },
  messageList: { padding: 16, gap: 8, flexGrow: 1 },
  bubble: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: Colors.primaryYellow, borderBottomRightRadius: 4 },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.amberBorder, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextMe: { color: Colors.darkBrown },
  bubbleTextThem: { color: Colors.darkBrown },
  bubbleTime: { fontSize: 10, marginTop: 4 },
  bubbleTimeMe: { color: Colors.deepAmber, textAlign: 'right' },
  bubbleTimeThem: { color: Colors.deepAmber },
  emptyChat: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyChatText: { fontSize: 13, color: Colors.deepAmber },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, gap: 8, backgroundColor: Colors.white, borderTopWidth: 0.5, borderTopColor: Colors.amberBorder },
  input: { flex: 1, backgroundColor: Colors.lightCream, borderWidth: 1, borderColor: Colors.amberBorder, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, fontSize: 14, color: Colors.darkBrown, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryYellow, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 16, color: Colors.darkBrown },
});
