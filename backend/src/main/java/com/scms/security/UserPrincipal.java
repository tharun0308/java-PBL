package com.scms.security;

import com.scms.users.entity.Role;
import com.scms.users.entity.StaffAdminStatus;
import com.scms.users.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

public class UserPrincipal implements UserDetails, OAuth2User, OidcUser {

    private final UUID id;
    private final String email;
    private final String password;
    private final String fullName;
    private final Role role;
    private final StaffAdminStatus staffAdminStatus;
    private final String userTitle;
    private final boolean onboardingCompleted;
    private final Integer academicYear;
    private final int staffAdminAppealCount;
    private final boolean active;
    private final Collection<? extends GrantedAuthority> authorities;
    private Map<String, Object> attributes;
    private OidcIdToken idToken;
    private OidcUserInfo userInfo;

    public UserPrincipal(UUID id, String email, String password, String fullName, Role role,
                         StaffAdminStatus staffAdminStatus, String userTitle,
                         boolean onboardingCompleted, Integer academicYear, int staffAdminAppealCount,
                         boolean active, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.staffAdminStatus = staffAdminStatus;
        this.userTitle = userTitle != null ? userTitle : "Student";
        this.onboardingCompleted = onboardingCompleted;
        this.academicYear = academicYear;
        this.staffAdminAppealCount = staffAdminAppealCount;
        this.active = active;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFullName(),
                user.getRole(),
                user.getStaffAdminStatus(),
                user.getUserTitle(),
                user.isOnboardingCompleted(),
                user.getAcademicYear(),
                user.getStaffAdminAppealCount(),
                user.isActive(),
                Collections.singletonList(authority)
        );
    }

    public static UserPrincipal create(User user, Map<String, Object> attributes) {
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        userPrincipal.setAttributes(attributes);
        return userPrincipal;
    }

    public static UserPrincipal create(User user, Map<String, Object> attributes, OidcIdToken idToken, OidcUserInfo userInfo) {
        UserPrincipal userPrincipal = UserPrincipal.create(user, attributes);
        userPrincipal.idToken = idToken;
        userPrincipal.userInfo = userInfo;
        return userPrincipal;
    }

    public UUID getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public Role getRole() {
        return role;
    }

    public StaffAdminStatus getStaffAdminStatus() {
        return staffAdminStatus;
    }

    public String getUserTitle() {
        return userTitle;
    }

    public boolean isOnboardingCompleted() {
        return onboardingCompleted;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public int getStaffAdminAppealCount() {
        return staffAdminAppealCount;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    public void setAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getName() {
        return email;
    }

    @Override
    public Map<String, Object> getClaims() {
        if (this.attributes != null) {
            return this.attributes;
        }
        if (this.idToken != null) {
            return this.idToken.getClaims();
        }
        return Collections.emptyMap();
    }

    @Override
    public OidcUserInfo getUserInfo() {
        return this.userInfo;
    }

    @Override
    public OidcIdToken getIdToken() {
        return this.idToken;
    }
}
