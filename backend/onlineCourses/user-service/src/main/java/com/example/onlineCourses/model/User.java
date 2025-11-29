package com.example.onlineCourses.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Entity
public class User implements UserDetails{
//public class User{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    private String password;
    private boolean enabled = false; //lien quan den xac thuc
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    @Column(length = 1000)
    private String bio;

    public enum Role {
        USER, STAFF, MANAGER, ADMIN    }
    @Enumerated(EnumType.STRING)
    private Role role;


    public void setRole(Role role) {
        this.role = role;
    }
    public Role getRole() {
        return role;
    }




    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override public String getPassword() { return password; }
    @Override public String getUsername() { return username; }
    @Override public boolean isEnabled() { return enabled; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
//
    public void setPassword(String password) { this.password = password; }
//

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

//
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
//
//    public String getUsername() {
//        return username;
//    }
    public void setUsername(String username) { this.username = username;
    }

//
//    public String getPassword() {
//        return password;
//    }
//
//    public boolean isEnabled() {
//        return enabled;
//    }
}
