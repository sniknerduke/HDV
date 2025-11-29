package com.example.onlineCourses.mapper;

import com.example.onlineCourses.DTO.UserDTO;
import com.example.onlineCourses.model.User;

public class UserMapper {
    public static UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        if (user.getRole() != null) {
            dto.setRole(user.getRole().name()); // convert enum -> String
        }
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        if (user.getDateOfBirth() != null) {
            dto.setDateOfBirth(user.getDateOfBirth().toString());
        }
        dto.setBio(user.getBio());
        return dto;
    }
}

