package com.AI_BASED.BACKEND.CONTROLLER;

import com.AI_BASED.BACKEND.DTO.DashboardResponse;
import com.AI_BASED.BACKEND.ENTITY.User;
import com.AI_BASED.BACKEND.SERVICE.DashboardService;
import com.AI_BASED.BACKEND.UTIL.AuthUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private AuthUtils authUtils;

    @GetMapping("/stats")
    public ResponseEntity<DashboardResponse> getDashboardStats() {
        User user = authUtils.getCurrentUser();
        DashboardResponse stats = dashboardService.getDashboardStats(user);
        return ResponseEntity.ok(stats);
    }
}
