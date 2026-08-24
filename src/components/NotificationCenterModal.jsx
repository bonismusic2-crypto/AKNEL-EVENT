import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Sparkles, 
  Calendar, 
  Music, 
  Tag, 
  FileCheck, 
  Trash2,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const INITIAL_WEB_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'concert',
    title: 'Grand Concert du Chantre Boniface',
    message: 'Le concert exceptionnel "Nuit d\'Exaltation" aura lieu le 15 Décembre 2026 au prestigieux AKNEL Hall. Billets en vente limitée !',
    time: 'Il y a 10 min',
    isRead: false,
    badge: 'Concert AKNEL Hall',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    actionText: 'Réserver un billet',
    actionLink: '/events'
  },
  {
    id: 'notif-2',
    type: 'album',
    title: 'Sortie Nouvel Album : "Espérance Vivante"',
    message: 'Le nouvel opus du Chantre Boniface contenant 12 titres inédits est disponible en exclusivité sur l\'application Bonis Musik.',
    time: 'Il y a 1 heure',
    isRead: false,
    badge: 'Nouvel Album',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    actionText: 'Découvrir les titres',
    actionLink: '/events'
  },
  {
    id: 'notif-3',
    type: 'promo',
    title: 'Offre Spéciale Salle de Mariage & Banquets',
    message: 'Profitez d\'une réduction exclusive de 15% sur la location du Grand Salon AKNEL pour vos événements réservés ce mois-ci.',
    time: 'Il y a 3 heures',
    isRead: false,
    badge: 'Promotion Exclusive',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    actionText: 'Demander un devis',
    actionLink: '/contact'
  },
  {
    id: 'notif-4',
    type: 'booking',
    title: 'Confirmation de Réservation & Visite',
    message: 'Notre équipe événementielle a validé votre créneau de visite privée des salons AKNEL. Rendez-vous au 12 Rue de la Paix.',
    time: 'Hier',
    isRead: true,
    badge: 'Réservation',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    actionText: 'Voir les détails',
    actionLink: '/services'
  },
  {
    id: 'notif-5',
    type: 'concert',
    title: 'Soirée Acoustique & Louange VIP',
    message: 'Une session intimiste avec les musiciens du groupe AKNEL Gospel est programmée vendredi prochain.',
    time: 'Il y a 2 jours',
    isRead: true,
    badge: 'Événement Spécial',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    actionText: 'En savoir plus',
    actionLink: '/venue'
  }
];

export const NotificationCenterModal = ({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDeleteNotification 
}) => {
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'concert', 'promo'
  const navigate = useNavigate();

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'concert') return notif.type === 'concert' || notif.type === 'album';
    if (filter === 'promo') return notif.type === 'promo' || notif.type === 'booking';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case 'concert':
        return <Calendar className="w-5 h-5 text-amber-600" />;
      case 'album':
        return <Music className="w-5 h-5 text-emerald-600" />;
      case 'promo':
        return <Tag className="w-5 h-5 text-rose-600" />;
      case 'booking':
        return <FileCheck className="w-5 h-5 text-blue-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  const handleActionClick = (notif) => {
    onMarkAsRead(notif.id);
    onClose();
    if (notif.actionLink) {
      navigate(notif.actionLink);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end p-0 sm:p-4 sm:pt-20">
        {/* Backdrop sombre flouté */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg h-[92vh] sm:h-auto sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-5 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="relative p-2 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
                <Bell size={22} className="text-amber-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg tracking-wide text-white">Centre de Notifications</h3>
                <p className="text-xs text-gray-300">
                  {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Vous êtes à jour !'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  title="Tout marquer comme lu"
                  className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-amber-400 hover:text-black text-white px-3 py-1.5 rounded-full transition-all duration-200 font-medium cursor-pointer"
                >
                  <CheckCheck size={14} />
                  <span className="hidden sm:inline">Tout lire</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Filtres Rapides */}
          <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100 overflow-x-auto text-xs scrollbar-none">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${filter === 'all' ? 'bg-dark text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'}`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 cursor-pointer ${filter === 'unread' ? 'bg-gold text-dark font-bold shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'}`}
            >
              Non lues ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('concert')}
              className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${filter === 'concert' ? 'bg-dark text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'}`}
            >
              Concerts & Albums
            </button>
            <button
              onClick={() => setFilter('promo')}
              className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${filter === 'promo' ? 'bg-dark text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'}`}
            >
              Offres & Salles
            </button>
          </div>

          {/* Liste des Notifications */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-50">
            {filteredNotifications.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <Bell size={28} />
                </div>
                <p className="font-semibold text-gray-700">Aucune notification</p>
                <p className="text-xs text-gray-400 mt-1">Vous n'avez aucun nouveau message dans cette section.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`pt-3 first:pt-0 p-3 rounded-xl transition-all border ${
                    !notif.isRead 
                      ? 'bg-amber-50/40 border-amber-200/70 shadow-sm' 
                      : 'bg-white hover:bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icône de type */}
                    <div className="p-2.5 rounded-xl bg-white shadow-sm border border-gray-100 shrink-0">
                      {getIcon(notif.type)}
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${notif.badgeColor || 'bg-gray-100 text-gray-800'}`}>
                            {notif.badge}
                          </span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping"></span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400 shrink-0">{notif.time}</span>
                      </div>

                      <h4 className={`text-sm font-bold leading-snug ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Bouton d'action et options */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100/80">
                        {notif.actionText ? (
                          <button
                            onClick={() => handleActionClick(notif)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-dark hover:text-gold bg-white hover:bg-dark hover:text-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-dark transition-all shadow-xs cursor-pointer"
                          >
                            <span>{notif.actionText}</span>
                            <ChevronRight size={13} />
                          </button>
                        ) : <div />}

                        <div className="flex items-center gap-1">
                          {!notif.isRead ? (
                            <button
                              onClick={() => onMarkAsRead(notif.id)}
                              className="text-[11px] text-amber-700 hover:text-amber-900 font-medium px-2 py-1 rounded hover:bg-amber-100/60 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Marquer comme lu"
                            >
                              <CheckCheck size={13} />
                              <span>Lu</span>
                            </button>
                          ) : null}

                          <button
                            onClick={() => onDeleteNotification(notif.id)}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Supprimer la notification"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer d'information */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              AKNEL Event & Bonis Musik
            </span>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-dark font-medium underline cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationCenterModal;
