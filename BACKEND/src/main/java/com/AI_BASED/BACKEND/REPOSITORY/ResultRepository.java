package com.AI_BASED.BACKEND.REPOSITORY;

import com.AI_BASED.BACKEND.ENTITY.Result;
import com.AI_BASED.BACKEND.ENTITY.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResultRepository extends JpaRepository<Result, Long> {

    List<Result> findByUser(User user);

}
