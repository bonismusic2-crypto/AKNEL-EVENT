import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Bell,
  CheckCheck,
  Video,
  BookOpen,
  Crown,
  Calendar,
  Sparkles,
  ChevronRight,
  Trash2,
  Music,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';

export const INITIAL_MOBILE_NOTIFICATIONS = [
  {
    id: 'm-notif-1',
    type: 'clip',
    title: 'Nouveau clip vidéo HD disponible !',
    message: 'Découvrez le clip officiel "Jésus est Roi" en haute définition 4K sur votre espace Médiathèque.',
    time: 'Il y a 15 min',
    isRead: false,
    badge: 'Nouveau Clip 4K',
    badgeBg: '#FEF3C7',
    badgeTextColor: '#92400E',
    actionType: 'clip',
    actionText: 'Regarder le clip',
  },
  {
    id: 'm-notif-2',
    type: 'teaching',
    title: 'Nouvel enseignement disponible',
    message: 'Écoutez le message inspirant "Marcher par la Foi au quotidien" dispensé par le Pasteur Boniface.',
    time: 'Il y a 2 heures',
    isRead: false,
    badge: 'Enseignement',
    badgeBg: '#E0E7FF',
    badgeTextColor: '#3730A3',
    actionType: 'teaching',
    actionText: 'Écouter maintenant',
  },
  {
    id: 'm-notif-3',
    type: 'subscription',
    title: 'Statut Abonnement VIP Actif',
    message: 'Votre pass VIP Premium est actif. Profitez du téléchargement hors-ligne et de la musique sans coupure.',
    time: 'Hier',
    isRead: false,
    badge: 'Abonnement VIP',
    badgeBg: '#DCFCE7',
    badgeTextColor: '#166534',
    actionType: 'paywall',
    actionText: 'Gérer mon pass',
  },
  {
    id: 'm-notif-4',
    type: 'concert',
    title: 'Rappel Concert AKNEL Hall',
    message: 'Le Grand Concert de Louange aura lieu le 15 Décembre à la salle de spectacle AKNEL Hall. Réservez votre place.',
    time: 'Il y a 2 jours',
    isRead: true,
    badge: 'Concert Live',
    badgeBg: '#FCE7F3',
    badgeTextColor: '#9D174D',
    actionType: 'concert',
    actionText: 'Détails de l\'événement',
  },
  {
    id: 'm-notif-5',
    type: 'album',
    title: 'Album "Espérance Vivante"',
    message: 'L\'album complet de 12 titres est en écoute libre pour tous les abonnés de Bonis Musik.',
    time: 'Il y a 3 jours',
    isRead: true,
    badge: 'Album Audio',
    badgeBg: '#F3E8FF',
    badgeTextColor: '#6B21A8',
    actionType: 'music',
    actionText: 'Écouter l\'album',
  },
];

export const NotificationsModal = ({
  visible,
  onClose,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNavigateAction,
}) => {
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'media', 'subscription'

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredList = notifications.filter((item) => {
    if (filter === 'unread') return !item.isRead;
    if (filter === 'media') return item.type === 'clip' || item.type === 'album' || item.type === 'teaching';
    if (filter === 'subscription') return item.type === 'subscription' || item.type === 'concert';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'clip':
        return <Video size={20} color={THEME.colors.gold} />;
      case 'teaching':
        return <BookOpen size={20} color="#4F46E5" />;
      case 'subscription':
        return <Crown size={20} color="#059669" />;
      case 'concert':
        return <Calendar size={20} color="#DB2777" />;
      case 'album':
        return <Music size={20} color="#7C3AED" />;
      default:
        return <Sparkles size={20} color={THEME.colors.gold} />;
    }
  };

  const handleAction = (item) => {
    if (onMarkAsRead) {
      onMarkAsRead(item.id);
    }
    if (onNavigateAction) {
      onNavigateAction(item);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.bellIconBox}>
              <Bell size={20} color={THEME.colors.gold} />
              {unreadCount > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <View>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>
                {unreadCount > 0
                  ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                  : 'Toutes les alertes sont lues'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={onMarkAllAsRead}
                style={styles.markAllBtn}
                activeOpacity={0.7}
              >
                <CheckCheck size={14} color={THEME.colors.gold} />
                <Text style={styles.markAllText}>Tout lire</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <X size={20} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtres d'onglets horizontaux */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            <TouchableOpacity
              onPress={() => setFilter('all')}
              style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === 'all' && styles.filterChipTextActive,
                ]}
              >
                Toutes ({notifications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter('unread')}
              style={[
                styles.filterChip,
                filter === 'unread' && styles.filterChipActiveGold,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === 'unread' && styles.filterChipTextActiveDark,
                ]}
              >
                Non lues ({unreadCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter('media')}
              style={[styles.filterChip, filter === 'media' && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === 'media' && styles.filterChipTextActive,
                ]}
              >
                Médias & Clips
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter('subscription')}
              style={[
                styles.filterChip,
                filter === 'subscription' && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === 'subscription' && styles.filterChipTextActive,
                ]}
              >
                VIP & Événements
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Liste des Notifications */}
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={styles.scrollListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredList.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Bell size={32} color={THEME.colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Aucune notification</Text>
              <Text style={styles.emptyText}>
                Vous n'avez aucun message dans cette catégorie pour le moment.
              </Text>
            </View>
          ) : (
            filteredList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  !item.isRead && styles.cardUnread,
                ]}
                activeOpacity={0.85}
                onPress={() => handleAction(item)}
              >
                <View style={styles.cardHeaderRow}>
                  {/* Icône de type */}
                  <View style={styles.cardIconBox}>
                    {getIcon(item.type)}
                  </View>

                  {/* Badges et Date */}
                  <View style={styles.cardHeaderMeta}>
                    <View style={styles.badgeAndDot}>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: item.badgeBg || '#FEF3C7' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryBadgeText,
                            { color: item.badgeTextColor || '#92400E' },
                          ]}
                        >
                          {item.badge}
                        </Text>
                      </View>
                      {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                </View>

                {/* Titre et Message */}
                <View style={styles.cardBody}>
                  <Text
                    style={[
                      styles.cardTitle,
                      !item.isRead && styles.cardTitleUnread,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.cardMessage}>{item.message}</Text>
                </View>

                {/* Footer Carte avec Bouton Action & Marquer comme lu */}
                <View style={styles.cardFooter}>
                  {item.actionText ? (
                    <View style={styles.actionBtn}>
                      <Text style={styles.actionBtnText}>{item.actionText}</Text>
                      <ChevronRight size={14} color={THEME.colors.gold} />
                    </View>
                  ) : <View />}

                  <View style={styles.cardActionsRight}>
                    {!item.isRead && (
                      <TouchableOpacity
                        onPress={() => onMarkAsRead && onMarkAsRead(item.id)}
                        style={styles.markReadBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <CheckCheck size={13} color={THEME.colors.gold} />
                        <Text style={styles.markReadText}>Lu</Text>
                      </TouchableOpacity>
                    )}

                    {onDeleteNotification && (
                      <TouchableOpacity
                        onPress={() => onDeleteNotification(item.id)}
                        style={styles.deleteBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Trash2 size={13} color={THEME.colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(197, 155, 39, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(197, 155, 39, 0.12)',
  },
  markAllText: {
    color: THEME.colors.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 10,
  },
  filtersScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterChipActiveGold: {
    backgroundColor: THEME.colors.gold,
    borderColor: THEME.colors.gold,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterChipTextActiveDark: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scrollList: {
    flex: 1,
  },
  scrollListContent: {
    padding: 20,
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardUnread: {
    backgroundColor: '#FFFDF7',
    borderColor: 'rgba(197, 155, 39, 0.4)',
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.gold,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeaderMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  badgeAndDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  timeText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  cardBody: {
    marginVertical: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 3,
  },
  cardTitleUnread: {
    fontWeight: '800',
    color: '#000000',
  },
  cardMessage: {
    fontSize: 12.5,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.gold,
  },
  cardActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(197, 155, 39, 0.1)',
  },
  markReadText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.gold,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: 'center',
  },
});
