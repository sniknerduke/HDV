package com.servicethongke.servicethongke;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients // Thêm dòng này
public class ServicethongkeApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServicethongkeApplication.class, args);
	}

}
