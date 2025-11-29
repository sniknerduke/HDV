package com.example.onlineCourses.controller;

import com.example.onlineCourses.model.Provider;
import com.example.onlineCourses.repository.ProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
@CrossOrigin(origins = "http://localhost:3000")
public class ProviderController {

    @Autowired
    private ProviderRepository providerRepo;

    @PostMapping
    public Provider createProvider(@RequestBody Provider provider) {
        return providerRepo.save(provider);
    }

    @GetMapping
    public List<Provider> getAllProviders() {
        return providerRepo.findAll();
    }
}
