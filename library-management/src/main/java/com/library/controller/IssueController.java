package com.library.controller;

import com.library.dto.request.IssueRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.IssueResponse;
import com.library.service.IssueService;
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
@RequestMapping("/api/issues")
@RequiredArgsConstructor
@Tag(name = "Issue & Return", description = "Issue and return library books")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('LIBRARIAN')")
public class IssueController {

    private final IssueService issueService;

    @PostMapping("/issue")
    @Operation(summary = "Issue a book to a member",
               description = "**Business rules enforced:**\n" +
                             "- Book must be available\n" +
                             "- Member cannot have more than 3 active issues")
    public ResponseEntity<ApiResponse<IssueResponse>> issueBook(@Valid @RequestBody IssueRequest request) {
        IssueResponse response = issueService.issueBook(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Book issued successfully", response));
    }

    @PutMapping("/return/{issueId}")
    @Operation(summary = "Return an issued book",
               description = "Marks the issue as RETURNED, sets return date, and makes book available again")
    public ResponseEntity<ApiResponse<IssueResponse>> returnBook(@PathVariable Long issueId) {
        IssueResponse response = issueService.returnBook(issueId);
        return ResponseEntity.ok(ApiResponse.success("Book returned successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all issue records")
    public ResponseEntity<ApiResponse<List<IssueResponse>>> getAllIssues() {
        return ResponseEntity.ok(ApiResponse.success(issueService.getAllIssues()));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all currently active (unreturned) issues")
    public ResponseEntity<ApiResponse<List<IssueResponse>>> getActiveIssues() {
        return ResponseEntity.ok(ApiResponse.success(issueService.getActiveIssues()));
    }

    @GetMapping("/{issueId}")
    @Operation(summary = "Get issue record by ID")
    public ResponseEntity<ApiResponse<IssueResponse>> getIssueById(@PathVariable Long issueId) {
        return ResponseEntity.ok(ApiResponse.success(issueService.getIssueById(issueId)));
    }
}
