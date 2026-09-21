package com.scms.controller;

import com.scms.model.ReportSummary;
import com.scms.service.AuthService;
import com.scms.service.ReportService;
import com.sun.net.httpserver.HttpExchange;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller serving aggregated reporting summaries and facility metrics.
 */
public class ReportHandler extends BaseHttpHandler {
    private final ReportService reportService;

    public ReportHandler(AuthService authService, ReportService reportService) {
        super(authService);
        this.reportService = reportService;
    }

    @Override
    protected void process(HttpExchange exchange) throws Exception {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendError(exchange, 405, "Method not allowed: " + exchange.getRequestMethod());
            return;
        }

        ReportSummary summary = reportService.getSummary();
        Map<String, Object> resp = new HashMap<>();
        resp.put("data", summary);
        sendJson(exchange, 200, resp);
    }
}
