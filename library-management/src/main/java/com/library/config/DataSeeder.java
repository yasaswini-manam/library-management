package com.library.config;

import com.library.entity.Book;
import com.library.entity.Member;
import com.library.entity.User;
import com.library.repository.BookRepository;
import com.library.repository.MemberRepository;
import com.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedData(UserRepository userRepo,
                               BookRepository bookRepo,
                               MemberRepository memberRepo) {
        return args -> {

            // ── Users ────────────────────────────────────────────────────
            if (!userRepo.existsByUsername("librarian")) {
                userRepo.save(User.builder()
                        .username("librarian")
                        .password(passwordEncoder.encode("librarian123"))
                        .role(User.Role.LIBRARIAN)
                        .build());
                log.info("Seeded LIBRARIAN user  → username: librarian / password: librarian123");
            }

            if (!userRepo.existsByUsername("member1")) {
                userRepo.save(User.builder()
                        .username("member1")
                        .password(passwordEncoder.encode("member123"))
                        .role(User.Role.MEMBER)
                        .build());
                log.info("Seeded MEMBER user     → username: member1 / password: member123");
            }

            // ── Books ────────────────────────────────────────────────────
            if (bookRepo.count() == 0) {
                bookRepo.saveAll(List.of(
                        Book.builder().title("Clean Code").author("Robert C. Martin").isbn("9780132350884").available(true).build(),
                        Book.builder().title("The Pragmatic Programmer").author("Andrew Hunt").isbn("9780135957059").available(true).build(),
                        Book.builder().title("Design Patterns").author("Gang of Four").isbn("9780201633610").available(true).build(),
                        Book.builder().title("Effective Java").author("Joshua Bloch").isbn("9780134685991").available(true).build(),
                        Book.builder().title("Spring in Action").author("Craig Walls").isbn("9781617294945").available(true).build(),
                        Book.builder().title("Head First Java").author("Kathy Sierra").isbn("9780596009205").available(true).build()
                ));
                log.info("Seeded 6 sample books");
            }

            // ── Members ──────────────────────────────────────────────────
            if (memberRepo.count() == 0) {
                memberRepo.saveAll(List.of(
                        Member.builder().name("Alice Johnson").email("alice@college.edu").phone("9876543210").build(),
                        Member.builder().name("Bob Smith").email("bob@college.edu").phone("9876543211").build(),
                        Member.builder().name("Carol White").email("carol@college.edu").phone("9876543212").build()
                ));
                log.info("Seeded 3 sample members");
            }
        };
    }
}
