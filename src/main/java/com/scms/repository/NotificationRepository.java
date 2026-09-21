package com.scms.repository;

import com.scms.model.Notification;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Repository for managing System Notifications.
 */
public class NotificationRepository {
    private final DataStore dataStore;

    public NotificationRepository() {
        this.dataStore = DataStore.getInstance();
    }

    public NotificationRepository(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public List<Notification> findByRecipient(String userId, boolean isAdmin, int limit) {
        return dataStore.getNotifications().stream()
                .filter(n -> (isAdmin && "admin".equalsIgnoreCase(n.getUser_id())) || (userId != null && userId.equals(n.getUser_id())))
                .limit(limit > 0 ? limit : 30)
                .collect(Collectors.toList());
    }

    public Notification save(Notification notification) {
        dataStore.addNotification(notification);
        return notification;
    }

    public void markAllRead(String userId, boolean isAdmin) {
        dataStore.markNotificationsRead(userId, isAdmin);
    }
}
