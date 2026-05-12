package com.library.service;

import com.library.dto.request.MemberRequest;
import com.library.dto.response.IssueResponse;
import com.library.dto.response.MemberResponse;
import com.library.entity.Member;
import com.library.exception.DuplicateResourceException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.IssueRecordRepository;
import com.library.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final IssueRecordRepository issueRecordRepository;

    @Transactional
    public MemberResponse registerMember(MemberRequest request) {
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Member with email " + request.getEmail() + " already exists");
        }
        Member member = Member.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .build();
        return MemberResponse.from(memberRepository.save(member));
    }

    @Transactional(readOnly = true)
    public MemberResponse getMemberById(Long memberId) {
        return MemberResponse.from(findMember(memberId));
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> getAllMembers() {
        return memberRepository.findAll()
                .stream()
                .map(MemberResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getBooksIssuedToMember(Long memberId) {
        findMember(memberId); // validate existence
        return issueRecordRepository.findByMemberMemberId(memberId)
                .stream()
                .map(IssueResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public MemberResponse updateMember(Long memberId, MemberRequest request) {
        Member member = findMember(memberId);
        if (!member.getEmail().equals(request.getEmail()) && memberRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email " + request.getEmail() + " is already in use");
        }
        member.setName(request.getName());
        member.setEmail(request.getEmail());
        member.setPhone(request.getPhone());
        return MemberResponse.from(memberRepository.save(member));
    }

    // ── Package-level helper used by IssueService ─────────────────────────
    public Member findMember(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + memberId));
    }
}
