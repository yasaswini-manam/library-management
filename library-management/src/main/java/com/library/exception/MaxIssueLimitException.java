package com.library.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class MaxIssueLimitException extends RuntimeException {
    public MaxIssueLimitException(String message) {
        super(message);
    }
}
