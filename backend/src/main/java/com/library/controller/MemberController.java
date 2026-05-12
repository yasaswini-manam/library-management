package com.library.controller;

import com.library.dto.request.MemberRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.IssueResponse;
import com.library.dto.response.MemberResponse;
import com.library.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@Tag(name = "Members", description = "Manage library members")
@SecurityRequirement(name = "bearerAuth")
public class MemberController {

    private final MemberService memberService;

    @PostMapping
    @PreAuthorize("hasRole('LIBRARIAN')")
    @Operation(summary = "Register a new member", description = "Librarian only")
    public ResponseEntity<ApiResponse<MemberResponse>> registerMember(@Valid @RequestBody MemberRequest request) {
        MemberResponse member = memberService.registerMember(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Member registered successfully", member));
    }

    @GetMapping
    @Operation(summary = "Get all members")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> getAllMembers() {
        return ResponseEntity.ok(ApiResponse.success(memberService.getAllMembers()));
    }

    @GetMapping("/{memberId}")
    @Operation(summary = "Get member by ID")
    public ResponseEntity<ApiResponse<MemberResponse>> getMemberById(@PathVariable Long memberId) {
        return ResponseEntity.ok(ApiResponse.success(memberService.getMemberById(memberId)));
    }

    @GetMapping("/{memberId}/issues")
    @Operation(summary = "View all books issued to a member")
    public ResponseEntity<ApiResponse<List<IssueResponse>>> getMemberIssues(@PathVariable Long memberId) {
        return ResponseEntity.ok(ApiResponse.success(memberService.getBooksIssuedToMember(memberId)));
    }

    @PutMapping("/{memberId}")
    @PreAuthorize("hasRole('LIBRARIAN')")
    @Operation(summary = "Update member details", description = "Librarian only")
    public ResponseEntity<ApiResponse<MemberResponse>> updateMember(
            @PathVariable Long memberId,
            @Valid @RequestBody MemberRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Member updated successfully",
                memberService.updateMember(memberId, request)));
    }
}
