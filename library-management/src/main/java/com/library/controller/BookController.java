package com.library.controller;

import com.library.dto.request.BookRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.BookResponse;
import com.library.service.BookService;
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
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Tag(name = "Books", description = "Manage library books")
@SecurityRequirement(name = "bearerAuth")
public class BookController {

    private final BookService bookService;

    @PostMapping
    @PreAuthorize("hasRole('LIBRARIAN')")
    @Operation(summary = "Add a new book", description = "Librarian only")
    public ResponseEntity<ApiResponse<BookResponse>> addBook(@Valid @RequestBody BookRequest request) {
        BookResponse book = bookService.addBook(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Book added successfully", book));
    }

    @GetMapping
    @Operation(summary = "Get all books")
    public ResponseEntity<ApiResponse<List<BookResponse>>> getAllBooks() {
        return ResponseEntity.ok(ApiResponse.success(bookService.getAllBooks()));
    }

    @GetMapping("/available")
    @Operation(summary = "Get all available books")
    public ResponseEntity<ApiResponse<List<BookResponse>>> getAvailableBooks() {
        return ResponseEntity.ok(ApiResponse.success(bookService.getAvailableBooks()));
    }

    @GetMapping("/{bookId}")
    @Operation(summary = "Get book by ID")
    public ResponseEntity<ApiResponse<BookResponse>> getBookById(@PathVariable Long bookId) {
        return ResponseEntity.ok(ApiResponse.success(bookService.getBookById(bookId)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search books by title or author keyword")
    public ResponseEntity<ApiResponse<List<BookResponse>>> searchBooks(
            @RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(bookService.searchBooks(keyword)));
    }

    @PutMapping("/{bookId}")
    @PreAuthorize("hasRole('LIBRARIAN')")
    @Operation(summary = "Update book details", description = "Librarian only")
    public ResponseEntity<ApiResponse<BookResponse>> updateBook(
            @PathVariable Long bookId,
            @Valid @RequestBody BookRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Book updated successfully",
                bookService.updateBook(bookId, request)));
    }

    @DeleteMapping("/{bookId}")
    @PreAuthorize("hasRole('LIBRARIAN')")
    @Operation(summary = "Delete a book", description = "Librarian only")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable Long bookId) {
        bookService.deleteBook(bookId);
        return ResponseEntity.ok(ApiResponse.success("Book deleted successfully", null));
    }
}
