import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, Inbox } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import { formatRelativeTime } from '../utils/time';

const VALID_PREFIXES = ['/orders', '/my-account', '/my-rewards', '/my-team', '/order-requests', '/retailers', '/rewards', '/teams', '/products'];

const isValidRoute = (link) => {
  if (typeof link !== 'string' || !link.startsWith('/')) return false;
  const path = link.split('?')[0].split('#')[0];
  if (path === '/' || path === '/admin') return true;
  return VALID_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));
};

const typeFallback = (type, role) => {
  switch (type) {
    case 'ORDER':
      return role === 'ADMIN' ? '/order-requests' : '/orders';
    case 'REWARD':
      return role === 'ADMIN' ? '/rewards' : '/my-rewards';
    case 'TEAM':
      return role === 'ADMIN' ? '/teams' : '/my-team';
    case 'PRODUCT':
      return '/products';
    case 'RETAILER':
      return '/retailers';
    case 'ACCOUNT':
      return role === 'ADMIN' ? '/admin' : '/';
    default:
      return null;
  }
};

const resolveLink = (notification, role) => {
  if (isValidRoute(notification?.link)) {
    return notification.link;
  }
  return typeFallback(notification?.type, role);
};

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    open,
    toggleOpen,
    close,
    markRead,
    markAllRead,
    remove,
  } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        close();
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, close]);

  const handleItemClick = (notification) => {
    if (!notification.isRead) {
      markRead(notification.id);
    }
    const link = resolveLink(notification, user?.role);
    if (link) {
      navigate(link);
    }
    close();
  };

  return (
    <div className="notif-bell" ref={dropdownRef}>
      <button className="notif-bell-btn" onClick={toggleOpen} aria-label="Notifications">
        <Bell size={20} />
        {unreadCount > 0 && <span className="notif-bell-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-title">Notifications</span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Inbox size={28} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notif-item ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleItemClick(notification)}
                >
                  <div className="notif-item-dot">
                    {!notification.isRead && <span className="notif-unread-dot" />}
                  </div>
                  <div className="notif-item-body">
                    <p className="notif-item-title">{notification.title}</p>
                    <p className="notif-item-message">{notification.message}</p>
                    <span className="notif-item-time">
                      {formatRelativeTime(notification.createdDate)}
                    </span>
                  </div>
                  <button
                    className="notif-item-delete"
                    aria-label="Delete notification"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(notification.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
