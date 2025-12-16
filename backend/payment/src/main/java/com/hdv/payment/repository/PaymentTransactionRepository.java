package com.hdv.payment.repository;
import com.hdv.payment.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
//    List<PaymentTransaction> findByOrderId(String orderId);
    Optional<PaymentTransaction> findByOrderId(String orderId);


}

