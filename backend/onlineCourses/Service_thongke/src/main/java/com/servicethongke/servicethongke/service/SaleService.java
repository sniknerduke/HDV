package com.servicethongke.servicethongke.service;

import com.servicethongke.servicethongke.dto.reponse.SaleResponse;
import com.servicethongke.servicethongke.dto.request.SaleRequest;
import com.servicethongke.servicethongke.entity.Course;
import com.servicethongke.servicethongke.entity.Sale;
import com.servicethongke.servicethongke.repository.CourseRepository;
import com.servicethongke.servicethongke.repository.SaleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SaleService {
    private final SaleRepository saleRepository;
    private final CourseRepository courseRepository;

    public SaleService(SaleRepository saleRepository, CourseRepository courseRepository) {
        this.saleRepository = saleRepository;
        this.courseRepository = courseRepository;
    }

    // 1. Tạo mới lượt bán (Create)
    public SaleResponse createSale(SaleRequest request) {
        // Tìm khóa học theo ID
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học ID: " + request.getCourseId()));

        Sale sale = new Sale();
        sale.setCourse(course);
        sale.setQuantity(request.getQuantity());
        sale.setPrice(request.getPrice());
        sale.setStatus(request.getStatus() != null ? request.getStatus() : "COMPLETED");

        // Nếu request có gửi ngày thì dùng ngày đó (để fake data), không thì lấy ngày hiện tại
        sale.setCreatedAt(request.getCreatedAt() != null ? request.getCreatedAt() : LocalDate.now());

        Sale savedSale = saleRepository.save(sale);
        return mapToResponse(savedSale);
    }

    // 2. Lấy danh sách tất cả lượt bán (Read)
    public List<SaleResponse> getAllSales() {
        return saleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 3. Sửa thông tin lượt bán (Update)
    public SaleResponse updateSale(Long id, SaleRequest request) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Sale ID: " + id));

        // Nếu muốn đổi khóa học cho lượt bán này
        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học ID: " + request.getCourseId()));
            sale.setCourse(course);
        }

        if (request.getQuantity() != null) sale.setQuantity(request.getQuantity());
        if (request.getPrice() != null) sale.setPrice(request.getPrice());
        if (request.getStatus() != null) sale.setStatus(request.getStatus());
        if (request.getCreatedAt() != null) sale.setCreatedAt(request.getCreatedAt());

        Sale updatedSale = saleRepository.save(sale);
        return mapToResponse(updatedSale);
    }

    // 4. Xóa lượt bán (Delete)
    public void deleteSale(Long id) {
        if (!saleRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Sale ID: " + id);
        }
        saleRepository.deleteById(id);
    }

    // Helper: Chuyển Entity sang Response DTO
    private SaleResponse mapToResponse(Sale sale) {
        return new SaleResponse(
                sale.getId(),
                sale.getCourse().getTitle(),
                sale.getCourse().getCode(),
                sale.getQuantity(),
                sale.getPrice(),
                sale.getStatus(),
                sale.getCreatedAt()
        );
    }
}
