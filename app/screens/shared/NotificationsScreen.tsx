import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { notificationService, AppNotification } from '../../services/notification.service';

const TYPE_ICONS: Record<string, string> = {
  'listing-claimed':    '🎉',
  'claim-confirmed':    '✅',
  'new-food-nearby':    '📍',
  'message-received':   '💬',
  'pickup-reminder':    '⏰',
  'pickup-completed':   '🤝',
  'listing-expiring':   '⌛',
  'listing-expired':    '📭',
  'donation-received':  '💛',
};

function groupByDay(notifications: AppNotification[]) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const groups: { title: string; data: AppNotification[] }[] = [];
  const map: Record<string, AppNotification[]> = {};

  for (const n of notifications) {
    const d = new Date(n.createdAt).toDateString();
    const label = d === today ? 'Today' : d === yesterday ? 'Yesterday' : new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
    if (!map[label]) { map[label] = []; groups.push({ title: label, data: map[label] }); }
    map[label].push(n);
  }
  return groups;
}

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchNotifications(refresh = false) {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.notifications);
      notificationService.markAllRead();
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { fetchNotifications(); }, []));

  const groups = groupByDay(notifications);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color={Colors.goldenAmber} style={styles.loader} />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.title}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchNotifications(true)} tintColor={Colors.goldenAmber} />}
          renderItem={({ item: group }) => (
            <View>
              <Text style={styles.groupHeader}>{group.title}</Text>
              {group.data.map((n) => (
                <View key={n._id} style={[styles.row, !n.read && styles.rowUnread]}>
                  <Text style={styles.icon}>{TYPE_ICONS[n.type] ?? '🔔'}</Text>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowTitle}>{n.title}</Text>
                    <Text style={styles.rowBody}>{n.body}</Text>
                    <Text style={styles.rowTime}>
                      {new Date(n.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  {!n.read && <View style={styles.dot} />}
                </View>
              ))}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptyHint}>You'll be notified when someone claims your food, sends you a message, or your pick-up is confirmed.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightCream },
  loader: { marginTop: 40 },
  groupHeader: { fontSize: 12, fontWeight: '600', color: Colors.deepAmber, paddingHorizontal: Spacing.screenPaddingHorizontal, paddingVertical: 10, backgroundColor: Colors.lightCream, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.screenPaddingHorizontal, gap: 12, backgroundColor: Colors.white, borderBottomWidth: 0.5, borderBottomColor: Colors.amberBorder },
  rowUnread: { backgroundColor: Colors.paleLemon },
  icon: { fontSize: 24, marginTop: 2 },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: Colors.darkBrown, marginBottom: 2 },
  rowBody: { fontSize: 13, color: Colors.deepAmber, lineHeight: 18, marginBottom: 4 },
  rowTime: { fontSize: 11, color: Colors.deepAmber, opacity: 0.7 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.goldenAmber, marginTop: 6 },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.darkBrown, marginBottom: 8 },
  emptyHint: { fontSize: 13, color: Colors.deepAmber, textAlign: 'center', lineHeight: 20 },
});
