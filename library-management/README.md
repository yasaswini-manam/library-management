# 📚 Library Management System

A production-ready RESTful backend for managing library books, members, and book issue/return operations.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Spring Boot 3.2 |
| Language | Java 21 |
| Security | Spring Security + JWT (jjwt 0.12) |
| Database | H2 (demo) / MySQL (production) |
| ORM | Spring Data JPA + Hibernate |
| Validation | Bean Validation (Jakarta) |
| Boilerplate | Lombok |
| API Docs | Springdoc OpenAPI / Swagger UI |

---

## 🚀 Quick Start

### 1. Clone & Build
```bash
git clone <repo>
cd library-management
mvn clean install
```

### 2. Run (H2 in-memory – zero config)
```bash
mvn spring-boot:run
```

### 3. Access
| URL | Description |
|-----|-------------|
| `http://localhost:8080/swagger-ui.html` | Swagger UI |
| `http://localhost:8080/h2-console` | H2 database console |

---

## 🗄️ MySQL Setup (Production)

1. Create database:
```sql
CREATE DATABASE library_db;
```

2. Edit `src/main/resources/application-mysql.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

3. Run with MySQL profile:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

---

## 🔐 Authentication

The API uses **JWT Bearer Token** authentication.

### Demo Credentials (auto-seeded on startup)

| Role | Username | Password |
|------|----------|----------|
| Librarian | `librarian` | `librarian123` |
| Member | `member1` | `member123` |

### Login Flow
```http
POST /api/auth/login
{
  "username": "librarian",
  "password": "librarian123"
}
```
Copy the `token` from the response and use it as:
```
Authorization: Bearer <token>
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login and get JWT token |

### Books
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/books` | LIBRARIAN | Add new book |
| GET | `/api/books` | ANY | List all books |
| GET | `/api/books/available` | ANY | List available books |
| GET | `/api/books/{id}` | ANY | Get book by ID |
| GET | `/api/books/search?keyword=x` | ANY | Search by title or author |
| PUT | `/api/books/{id}` | LIBRARIAN | Update book |
| DELETE | `/api/books/{id}` | LIBRARIAN | Delete book |

### Members
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/members` | LIBRARIAN | Register member |
| GET | `/api/members` | ANY | List all members |
| GET | `/api/members/{id}` | ANY | Get member by ID |
| GET | `/api/members/{id}/issues` | ANY | Books issued to member |
| PUT | `/api/members/{id}` | LIBRARIAN | Update member |

### Issue & Return
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/issues/issue` | LIBRARIAN | Issue a book |
| PUT | `/api/issues/return/{issueId}` | LIBRARIAN | Return a book |
| GET | `/api/issues` | LIBRARIAN | All issue records |
| GET | `/api/issues/active` | LIBRARIAN | Active issues only |
| GET | `/api/issues/{id}` | LIBRARIAN | Issue record by ID |

---

## ⚙️ Business Rules Enforced

| Rule | HTTP Status on Violation |
|------|--------------------------|
| Book must be available to issue | `409 Conflict` |
| Member can have max 3 active issues | `422 Unprocessable Entity` |
| ISBN must be unique | `409 Conflict` |
| Email must be unique per member | `409 Conflict` |

---

## 📦 Project Structure

```
src/main/java/com/library/
├── LibraryApplication.java
├── config/
│   ├── DataSeeder.java        ← Auto-seeds demo data
│   ├── SecurityConfig.java    ← JWT + role-based security
│   └── SwaggerConfig.java     ← OpenAPI 3 setup
├── controller/
│   ├── AuthController.java
│   ├── BookController.java
│   ├── MemberController.java
│   └── IssueController.java
├── dto/
│   ├── request/               ← Input DTOs with validation
│   └── response/              ← Output DTOs + ApiResponse wrapper
├── entity/
│   ├── Book.java
│   ├── Member.java
│   ├── IssueRecord.java
│   └── User.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── BookNotAvailableException.java
│   ├── MaxIssueLimitException.java
│   ├── DuplicateResourceException.java
│   └── ResourceNotFoundException.java
├── repository/
│   ├── BookRepository.java
│   ├── MemberRepository.java
│   ├── IssueRecordRepository.java
│   └── UserRepository.java
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── UserDetailsServiceImpl.java
└── service/
    ├── AuthService.java
    ├── BookService.java
    ├── MemberService.java
    └── IssueService.java
```

---

## 🧪 Testing with Postman

1. Import `LibraryManagement.postman_collection.json`
2. Run **"Login as Librarian"** – the token is auto-saved to collection variable
3. All other requests will use it automatically

---

## 📋 Sample API Responses

### Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "username": "librarian",
    "role": "LIBRARIAN",
    "expiresInMs": 86400000
  }
}
```

### Issue Book – Business Rule Violation
```json
{
  "timestamp": "2024-05-12T10:00:00",
  "status": 409,
  "error": "Book Not Available",
  "message": "Book 'Clean Code' is currently issued to another member"
}
```

### Validation Error
```json
{
  "timestamp": "2024-05-12T10:00:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "One or more fields are invalid",
  "fieldErrors": {
    "email": "Email must be valid",
    "isbn": "ISBN must be 10 or 13 digits"
  }
}
```
