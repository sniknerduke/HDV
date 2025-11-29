package com.hdv.payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
//    List<PaymentTransaction> findByOrderId(String orderId);
    Optional<PaymentTransaction> findByOrderId(String orderId);


}

