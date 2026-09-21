package com.scms.repository;

import com.scms.model.User;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface and implementation for User persistence.
 */
public class UserRepository {
    private final DataStore dataStore;

    public UserRepository() {
        this.dataStore = DataStore.getInstance();
    }

    public UserRepository(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public Optional<User> findByEmail(String email) {
        if (email == null) return Optional.empty();
        return dataStore.getUsers().stream()
                .filter(u -> email.trim().equalsIgnoreCase(u.getEmail()))
                .findFirst();
    }

    public Optional<User> findById(String id) {
        if (id == null) return Optional.empty();
        return dataStore.getUsers().stream()
                .filter(u -> id.equals(u.getId()))
                .findFirst();
    }

    public List<User> findAll() {
        return dataStore.getUsers();
    }

    public User save(User user) {
        dataStore.addUser(user);
        return user;
    }
}
