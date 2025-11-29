package com.example.onlineCourses.repository;

import com.example.onlineCourses.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
//import org.springframework.security.core.userdetails.User;  vi sao sai***

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);

//    @Query("SELECT u.id FROM User u WHERE u.username = :username")
//    Optional<User> findIdByUsername(String username);

}
