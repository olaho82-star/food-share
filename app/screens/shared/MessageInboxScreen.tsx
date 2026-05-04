import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { messageService } from '../../services/message.service';
import { useAuthStore } from '../../store/authStore';

type Conversation = {
  listing: { _id: string; title: string; borough: string; status: string; photoUrl: string };
  lastMessage: { content: string; senderId: string; createdAt: string };
  unreadCount: number;
};

export function MessageInboxScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchConversations(refresh = false) {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await messageService.getConversations();
      setConversations(res.conversations);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { fetchConversations(); }, []));

  function formatTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color={Colors.goldenAmber} style={styles.loader} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.listing._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchConversations(true)} tintColor={Colors.goldenAmber} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('ChatThread', { listingId: item.listing._id, listingTitle: item.listing.title })}
              activeOpacity={0.8}
            >
              {item.listing.photoUrl ? (
                <Image source={{ uri: item.listing.photoUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarEmoji}>🍱</Text>
                </View>
              )}
              <View style={styles.rowContent}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{item.listing.title}</Text>
                  <Text style={styles.rowTime}>{formatTime(item.lastMessage.createdAt)}</Text>
                </View>
                <View style={styles.rowBottom}>
                  <Text style={styles.rowPreview} numberOfLines={1}>
                    {item.lastMessage.senderId === user?._id ? 'You: ' : ''}{item.lastMessage.content}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptyHint}>Messages appear here when you contact a donor or recipient about a listing.</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream },
  loader: { marginTop: 40 },
  row: { flexDirection: 'row', padding: Spacing.screenPaddingHorizontal, alignItems: 'center', gap: 12, backgroundColor: Colors.white },
  avatar: { width: 52, height: 52, borderRadius: 10 },
  avatarPlaceholder: { backgroundColor: Colors.paleLemon, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 24 },
  rowContent: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: Colors.darkBrown, flex: 1, marginRight: 8 },
  rowTime: { fontSize: 11, color: Colors.deepAmber },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowPreview: { fontSize: 12, color: Colors.deepAmber, flex: 1 },
  badge: { backgroundColor: Colors.goldenAmber, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  separator: { height: 0.5, backgroundColor: Colors.amberBorder },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.darkBrown, marginBottom: 8 },
  emptyHint: { fontSize: 13, color: Colors.deepAmber, textAlign: 'center', lineHeight: 20 },
});
