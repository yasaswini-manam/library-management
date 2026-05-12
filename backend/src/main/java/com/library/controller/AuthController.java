package com.library.controller;

import com.library.dto.request.LoginRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.AuthResponse;
import com.library.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login and obtain JWT token")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login",
               description = "Authenticate with username & password. Returns a JWT token.\n\n" +
                             "**Demo credentials:**\n" +
                             "- Librarian: `librarian` / `librarian123`\n" +
                             "- Member: `member1` / `member123`")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }
}
