package com.library.dto.response;

import com.library.entity.IssueRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class IssueResponse {

    private Long issueId;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private Long memberId;
    private String memberName;
    private String memberEmail;
    private LocalDate issueDate;
    private LocalDate returnDate;
    private String status;

    public static IssueResponse from(IssueRecord record) {
        return IssueResponse.builder()
                .issueId(record.getIssueId())
                .bookId(record.getBook().getBookId())
                .bookTitle(record.getBook().getTitle())
                .bookAuthor(record.getBook().getAuthor())
                .memberId(record.getMember().getMemberId())
                .memberName(record.getMember().getName())
                .memberEmail(record.getMember().getEmail())
                .issueDate(record.getIssueDate())
                .returnDate(record.getReturnDate())
                .status(record.getStatus().name())
                .build();
    }
}
