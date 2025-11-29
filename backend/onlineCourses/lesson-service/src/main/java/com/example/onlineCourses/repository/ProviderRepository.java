package com.example.onlineCourses.repository;

import com.example.onlineCourses.model.Provider;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProviderRepository extends JpaRepository<Provider, Long> {
    // Bạn có thể thêm các phương thức tìm kiếm tùy chỉnh ở đây nếu cần
    Provider findByName(String name);
}
