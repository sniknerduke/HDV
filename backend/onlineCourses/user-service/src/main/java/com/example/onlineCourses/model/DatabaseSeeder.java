package com.example.onlineCourses.model;

import com.github.javafaker.Faker;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
// Import các Entity Order và OrderItem của bạn

@Component
//public class DatabaseSeeder implements CommandLineRunner {
public class DatabaseSeeder{

    private final EntityManager entityManager;
    private final Faker faker = new Faker();
    private final PasswordEncoder passwordEncoder;

    // Số lượng bản ghi muốn tạo
    private final int NUMBER_OF_ORDERS = 500;
    private final int MAX_ITEMS_PER_ORDER = 5; // Tối đa 5 item/order
    private final int NUMBER_OF_USERS = 100;
    private final int NUMBER_OF_COURSES = 500;

    public DatabaseSeeder(EntityManager entityManager, PasswordEncoder passwordEncoder) {
        this.entityManager = entityManager;
        this.passwordEncoder = passwordEncoder;
    }
 //chạy mỗi lần run
//    @Override
//    @Transactional // Đảm bảo toàn bộ quá trình là 1 transaction
//    public void run(String... args) throws Exception {
//        // Chỉ chạy seeding khi DB trống (Tùy chọn)
////        Long count = (Long) entityManager.createQuery("SELECT COUNT(o) FROM Order o").getSingleResult();
////        if (count > 0) {
////            System.out.println("Cơ sở dữ liệu đã có dữ liệu. Bỏ qua Seeding.");
////            return;
////        }
//
//        System.out.println("--- Bắt đầu Seeding Dữ liệu Demo ---");
//
//        cleanUpOldData(); // Bắt buộc phải chạy trước
//        // 1. Chạy Seeding User trước
//        seedUsers();
//        seedOrdersAndOrderItems();
//
//        System.out.println("--- Seeding Hoàn tất! Đã tạo " + NUMBER_OF_ORDERS + " đơn hàng ---");
//    }
//...
// ... tiếp tục trong lớp DatabaseSeeder
    private void cleanUpOldData() {
        System.out.println("1. Xóa dữ liệu cũ (TRUNCATE)...");
        try {
            // Tắt kiểm tra khóa ngoại (ví dụ cho MySQL)
            // Nếu dùng PostgreSQL/khác, hãy dùng lệnh phù hợp (ví dụ: TRUNCATE... RESTART IDENTITY)
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 0").executeUpdate();

            // Xóa bảng con (orderItems) trước
            entityManager.createNativeQuery("TRUNCATE TABLE order_items").executeUpdate();

            // Xóa bảng cha (orders) sau
            entityManager.createNativeQuery("TRUNCATE TABLE orders").executeUpdate();

//            // 3. Xóa bảng cha (User)
//            entityManager.createNativeQuery("TRUNCATE TABLE users").executeUpdate();

            // Bật lại kiểm tra khóa ngoại
            entityManager.createNativeQuery("SET FOREIGN_KEY_CHECKS = 1").executeUpdate();

            System.out.println("   -> Đã xóa dữ liệu cũ thành công.");
        } catch (Exception e) {
            System.err.println("Lỗi khi TRUNCATE: " + e.getMessage());
            // Xử lý lỗi (ví dụ: nếu bảng không tồn tại)
        }
    }
//...
// ... tiếp tục trong lớp DatabaseSeeder
private void seedOrdersAndOrderItems() {
    System.out.println("2. Bắt đầu tạo và chèn dữ liệu mới...");

    List<Order> ordersToPersist = new ArrayList<>();

    for (int i = 0; i < NUMBER_OF_ORDERS; i++) {
        Order order = createFakeOrder(i);

        // Tạo các OrderItem cho Order này
        int numberOfItems = faker.number().numberBetween(1, MAX_ITEMS_PER_ORDER);
        long totalAmount = 0;

        for (int j = 0; j < numberOfItems; j++) {
            OrderItem item = createFakeOrderItem(order);
            order.getItems().add(item);
            totalAmount += item.getPrice();
        }

        // Cập nhật tổng tiền (amount) và trạng thái
        order.setAmount(totalAmount);
//        order.setStatus(faker.options().option("PAID", "PENDING", "FAILED"));
        order.setStatus(faker.options().option("SUCCESS"));


        ordersToPersist.add(order);
    }

    // --- Bulk Insert (tận dụng Hibernate Session) ---
    // Hibernate/JPA sẽ tối ưu việc chèn này trong 1 transaction lớn
    for (Order order : ordersToPersist) {
        entityManager.persist(order);
    }

    // Ép dữ liệu xuống DB ngay lập tức
    entityManager.flush();
    entityManager.clear();

    System.out.println("   -> Đã tạo và chèn thành công " + NUMBER_OF_ORDERS + " đơn hàng.");
}

    // --- Hàm tạo Dữ liệu Giả lập ---

    private void seedUsers() {
        System.out.println("2a. Bắt đầu tạo và chèn " + NUMBER_OF_USERS + " User mới...");

        List<User> usersToPersist = new ArrayList<>();
        User.Role[] roles = User.Role.values();

        // Tạo 4 tài khoản quản trị/demo cụ thể
        usersToPersist.add(createSpecificUser("admin", "admin@demo.com", "123456", User.Role.ADMIN, true));
        usersToPersist.add(createSpecificUser("manager", "manager@demo.com", "123456", User.Role.MANAGER, true));
        usersToPersist.add(createSpecificUser("staff", "staff@demo.com", "123456", User.Role.STAFF, true));

        // Tạo các User mẫu còn lại
        for (int i = usersToPersist.size(); i < NUMBER_OF_USERS; i++) {
            User user = new User();
            String firstName = faker.name().firstName();
            String lastName = faker.name().lastName();
            String baseName = firstName.toLowerCase() + "." + lastName.toLowerCase();

            user.setUsername(faker.regexify("[a-z]{5,10}") + faker.number().digits(3)); // Username ngẫu nhiên
            user.setEmail(baseName + "@" + faker.internet().domainName());

            // **BẮT BUỘC:** Băm mật khẩu trước khi lưu
            user.setPassword(passwordEncoder.encode("password")); // Đặt mật khẩu chung là 'password'

            user.setEnabled(faker.bool().bool()); // Ngẫu nhiên true/false

            // Ngẫu nhiên chọn Role (trừ ADMIN, MANAGER, STAFF để giữ lại cho các user cụ thể)
            user.setRole(faker.options().option(User.Role.USER));

            usersToPersist.add(user);
        }

        // Thực hiện Bulk Insert
        for (User user : usersToPersist) {
            entityManager.persist(user);
        }

        entityManager.flush();
        entityManager.clear();

        System.out.println("   -> Đã tạo và chèn thành công " + usersToPersist.size() + " User.");
    }

    // Hàm hỗ trợ tạo user cụ thể
    private User createSpecificUser(String username, String email, String password, User.Role role, boolean enabled) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setEnabled(enabled);
        return user;
    }
//...

    private Order createFakeOrder(int index) {
        Order order = new Order();
        // Faker cho userId, giả định có 100 User mẫu (ID từ 1 đến 100)
        order.setUserId(faker.number().numberBetween(1L, 100L));

        // Giả lập thời gian tạo trong vòng 1 năm qua
        order.setCreatedAt(faker.date().past(365, TimeUnit.DAYS).toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());

        // orderId và status MẶC ĐỊNH được xử lý bởi @PrePersist,
        // nhưng có thể ghi đè status sau khi tính toán amount.

        //có thể set các thuộc tính khác nếu cần
        return order;
    }

    private OrderItem createFakeOrderItem(Order order) {
        OrderItem item = new OrderItem();
        item.setOrder(order);

        // Giả lập CourseId và Price
        item.setCourseId(faker.number().numberBetween(1L, 50L)); // Giả định 50 khóa học mẫu
        item.setCourseName(faker.commerce().department() + " Course: " + faker.programmingLanguage().name());
        item.setPrice(faker.number().numberBetween(100_000, 5_000_000) / 100_000 * 100_000); // Làm tròn đến 100k

        return item;
    }
}