package com.library.repository;

import com.library.entity.IssueRecord;
import com.library.entity.IssueRecord.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface IssueRecordRepository extends JpaRepository<IssueRecord, Long> {

    long countByMemberMemberIdAndStatus(Long memberId, Status status);

    List<IssueRecord> findByMemberMemberId(Long memberId);

    List<IssueRecord> findByMemberMemberIdAndStatus(Long memberId, Status status);

    Optional<IssueRecord> findByBookBookIdAndStatus(Long bookId, Status status);

    boolean existsByBookBookIdAndStatus(Long bookId, Status status);
}
