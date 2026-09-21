package com.scms.repository;

import com.scms.model.*;
import com.scms.util.JsonUtil;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Thread-safe Central Persistence Store managing JSON read/writes to data/scms_data.json.
 */
public class DataStore {
    private static DataStore instance;
    private final String dataFilePath;
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();

    private final List<User> users = new ArrayList<>();
    private final List<Complaint> complaints = new ArrayList<>();
    private final List<ComplaintHistory> history = new ArrayList<>();
    private final List<Notification> notifications = new ArrayList<>();

    private DataStore(String dataFilePath) {
        this.dataFilePath = dataFilePath;
        load();
    }

    public static synchronized DataStore getInstance() {
        if (instance == null) {
            String projectDir = System.getProperty("user.dir");
            String defaultPath = Paths.get(projectDir, "data", "scms_data.json").toString();
            instance = new DataStore(defaultPath);
        }
        return instance;
    }

    public static synchronized void init(String customFilePath) {
        instance = new DataStore(customFilePath);
    }

    @SuppressWarnings("unchecked")
    public void load() {
        rwLock.writeLock().lock();
        try {
            File file = new File(dataFilePath);
            if (!file.exists()) {
                File parent = file.getParentFile();
                if (parent != null && !parent.exists()) {
                    parent.mkdirs();
                }
                seedDefaults();
                saveInternal();
                return;
            }

            byte[] bytes = Files.readAllBytes(file.toPath());
            String json = new String(bytes, StandardCharsets.UTF_8);
            Map<String, Object> root = JsonUtil.parseObject(json);

            users.clear();
            List<Object> userList = (List<Object>) root.get("users");
            if (userList != null) {
                for (Object item : userList) {
                    if (item instanceof Map) {
                        Map<String, Object> m = (Map<String, Object>) item;
                        User u = new User();
                        u.setId((String) m.get("id"));
                        u.setEmail((String) m.get("email"));
                        u.setPassword((String) m.get("password"));
                        u.setFull_name((String) m.get("full_name"));
                        u.setRole((String) m.get("role"));
                        u.setCreated_at((String) m.get("created_at"));
                        users.add(u);
                    }
                }
            }

            complaints.clear();
            List<Object> complaintList = (List<Object>) root.get("complaints");
            if (complaintList != null) {
                for (Object item : complaintList) {
                    if (item instanceof Map) {
                        Map<String, Object> m = (Map<String, Object>) item;
                        Complaint c = new Complaint();
                        c.setId((String) m.get("id"));
                        Object numObj = m.get("complaint_number");
                        if (numObj instanceof Number) {
                            c.setComplaint_number(((Number) numObj).intValue());
                        }
                        c.setUser_id((String) m.get("user_id"));
                        c.setCategory((String) m.get("category"));
                        c.setLocation((String) m.get("location"));
                        c.setDescription((String) m.get("description"));
                        c.setPriority((String) m.get("priority"));
                        c.setStatus((String) m.get("status"));
                        c.setAssigned_to((String) m.get("assigned_to"));
                        c.setResolution_note((String) m.get("resolution_note"));
                        c.setImage_url((String) m.get("image_url"));
                        c.setResolution_image_url((String) m.get("resolution_image_url"));
                        Object ratingObj = m.get("rating");
                        if (ratingObj instanceof Number) {
                            c.setRating(((Number) ratingObj).intValue());
                        }
                        c.setFeedback_note((String) m.get("feedback_note"));
                        c.setRated_at((String) m.get("rated_at"));
                        c.setCreated_at((String) m.get("created_at"));
                        c.setUpdated_at((String) m.get("updated_at"));
                        complaints.add(c);
                    }
                }
            }

            history.clear();
            List<Object> histList = (List<Object>) root.get("history");
            if (histList != null) {
                for (Object item : histList) {
                    if (item instanceof Map) {
                        Map<String, Object> m = (Map<String, Object>) item;
                        ComplaintHistory h = new ComplaintHistory();
                        h.setId((String) m.get("id"));
                        h.setComplaint_id((String) m.get("complaint_id"));
                        h.setOld_status((String) m.get("old_status"));
                        h.setNew_status((String) m.get("new_status"));
                        h.setNote((String) m.get("note"));
                        h.setUpdated_by((String) m.get("updated_by"));
                        h.setUpdated_at((String) m.get("updated_at"));
                        history.add(h);
                    }
                }
            }

            notifications.clear();
            List<Object> notifList = (List<Object>) root.get("notifications");
            if (notifList != null) {
                for (Object item : notifList) {
                    if (item instanceof Map) {
                        Map<String, Object> m = (Map<String, Object>) item;
                        Notification n = new Notification();
                        n.setId((String) m.get("id"));
                        n.setUser_id((String) m.get("user_id"));
                        n.setTitle((String) m.get("title"));
                        n.setMessage((String) m.get("message"));
                        n.setLink((String) m.get("link"));
                        Object readObj = m.get("read");
                        n.setRead(Boolean.TRUE.equals(readObj));
                        n.setCreated_at((String) m.get("created_at"));
                        notifications.add(n);
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("[DataStore] Error loading database: " + e.getMessage());
            e.printStackTrace();
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public void save() {
        rwLock.writeLock().lock();
        try {
            saveInternal();
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    private void saveInternal() {
        try {
            Map<String, Object> root = new LinkedHashMap<>();
            root.put("users", users);
            root.put("complaints", complaints);
            root.put("history", history);
            root.put("notifications", notifications);

            String json = JsonUtil.toJson(root);
            File file = new File(dataFilePath);
            File parent = file.getParentFile();
            if (parent != null && !parent.exists()) {
                parent.mkdirs();
            }
            Files.write(file.toPath(), json.getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            System.err.println("[DataStore] Error saving database: " + e.getMessage());
        }
    }

    private void seedDefaults() {
        users.add(new User("11111111-1111-1111-1111-111111111111", "admin@college.edu", "Password123!", "Campus Administrator", "admin", "2026-08-21T09:45:32.395Z"));
        users.add(new User("22222222-2222-2222-2222-222222222222", "student@college.edu", "Password123!", "Alex Johnson", "user", "2026-09-05T09:45:32.398Z"));
    }

    // Accessors with locking
    public List<User> getUsers() {
        rwLock.readLock().lock();
        try {
            return new ArrayList<>(users);
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public List<Complaint> getComplaints() {
        rwLock.readLock().lock();
        try {
            return new ArrayList<>(complaints);
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public List<ComplaintHistory> getHistory() {
        rwLock.readLock().lock();
        try {
            return new ArrayList<>(history);
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public List<Notification> getNotifications() {
        rwLock.readLock().lock();
        try {
            return new ArrayList<>(notifications);
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public void addUser(User u) {
        rwLock.writeLock().lock();
        try {
            users.add(u);
            saveInternal();
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public void addComplaint(Complaint c) {
        rwLock.writeLock().lock();
        try {
            complaints.add(c);
            saveInternal();
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public void updateComplaint(Complaint c) {
        rwLock.writeLock().lock();
        try {
            for (int i = 0; i < complaints.size(); i++) {
                if (complaints.get(i).getId().equals(c.getId())) {
                    complaints.set(i, c);
                    break;
                }
            }
            saveInternal();
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public void addHistory(ComplaintHistory h) {
        rwLock.writeLock().lock();
        try {
            history.add(h);
            saveInternal();
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public void addNotification(Notification n) {
        rwLock.writeLock().lock();
        try {
            notifications.add(0, n); // prepend newest
            saveInternal();
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public void markNotificationsRead(String userId, boolean isAdmin) {
        rwLock.writeLock().lock();
        try {
            for (Notification n : notifications) {
                if ((isAdmin && "admin".equalsIgnoreCase(n.getUser_id())) || n.getUser_id().equals(userId)) {
                    n.setRead(true);
                }
            }
            saveInternal();
        } finally {
            rwLock.writeLock().unlock();
        }
    }
}
