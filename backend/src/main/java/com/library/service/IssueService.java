package com.library.service;

import com.library.dto.request.IssueRequest;
import com.library.dto.response.IssueResponse;
import com.library.entity.Book;
import com.library.entity.IssueRecord;
import com.library.entity.IssueRecord.Status;
import com.library.entity.Member;
import com.library.exception.BookNotAvailableException;
import com.library.exception.MaxIssueLimitException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.IssueRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueService {

    private static final int MAX_ISSUE_LIMIT = 3;

    private final IssueRecordRepository issueRecordRepository;
    private final BookRepository bookRepository;
    private final BookService bookService;
    private final MemberService memberService;

    // ── Issue a book ───────────────────────────────────────────────────────
    @Transactional
    public IssueResponse issueBook(IssueRequest request) {

        Book book = bookService.findBook(request.getBookId());
        Member member = memberService.findMember(request.getMemberId());

        // Rule 1: Book must be available
        if (!book.isAvailable()) {
            throw new BookNotAvailableException(
                    "Book '" + book.getTitle() + "' is currently issued to another member");
        }

        // Rule 2: Member cannot have more than 3 active issues
        long activeIssues = issueRecordRepository.countByMemberMemberIdAndStatus(
                member.getMemberId(), Status.ACTIVE);
        if (activeIssues >= MAX_ISSUE_LIMIT) {
            throw new MaxIssueLimitException(
                    "Member '" + member.getName() + "' has reached the maximum limit of " + MAX_ISSUE_LIMIT + " active issues");
        }

        // Mark book unavailable
        book.setAvailable(false);
        bookRepository.save(book);

        // Create issue record
        IssueRecord record = IssueRecord.builder()
                .book(book)
                .member(member)
                .issueDate(LocalDate.now())
                .status(Status.ACTIVE)
                .build();

        return IssueResponse.from(issueRecordRepository.save(record));
    }

    // ── Return a book ──────────────────────────────────────────────────────
    @Transactional
    public IssueResponse returnBook(Long issueId) {

        IssueRecord record = issueRecordRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue record not found with id: " + issueId));

        if (record.getStatus() == Status.RETURNED) {
            throw new BookNotAvailableException("Book has already been returned for issue id: " + issueId);
        }

        // Update record
        record.setReturnDate(LocalDate.now());
        record.setStatus(Status.RETURNED);
        issueRecordRepository.save(record);

        // Mark book available again
        Book book = record.getBook();
        book.setAvailable(true);
        bookRepository.save(book);

        return IssueResponse.from(record);
    }

    // ── Read operations ────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<IssueResponse> getAllIssues() {
        return issueRecordRepository.findAll()
                .stream()
                .map(IssueResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getActiveIssues() {
        return issueRecordRepository.findAll()
                .stream()
                .filter(r -> r.getStatus() == Status.ACTIVE)
                .map(IssueResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IssueResponse getIssueById(Long issueId) {
        IssueRecord record = issueRecordRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue record not found with id: " + issueId));
        return IssueResponse.from(record);
    }
}
