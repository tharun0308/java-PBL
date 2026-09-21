package com.scms.service;

import com.scms.model.AiClassificationResult;
import com.scms.model.Category;
import com.scms.model.Complaint;
import com.scms.util.TextSimilarity;

import java.util.*;

/**
 * Intelligent AI Auto-Triage inference engine.
 * Classifies categories, determines risk/urgency priority, recommends maintenance units, and detects duplicate tickets.
 */
public class AiTriageService {

    private static final Map<Category, List<String>> CATEGORY_KEYWORDS = new EnumMap<>(Category.class);
    private static final Map<Category, String> DEPARTMENT_ASSIGNMENTS = new EnumMap<>(Category.class);

    private static final List<String> HIGH_PRIORITY_KEYWORDS = Arrays.asList(
            "spark", "smoke", "fire", "shock", "severe", "danger", "hazard", "emergency",
            "overflowing", "urgent", "continuous", "burst", "collapsed", "exposed wire"
    );

    private static final List<String> LOW_PRIORITY_KEYWORDS = Arrays.asList(
            "minor", "request", "slow", "dust", "cosmetic", "paint", "suggestion"
    );

    static {
        CATEGORY_KEYWORDS.put(Category.ELECTRICAL, Arrays.asList(
                "spark", "shock", "short circuit", "wire", "fan", "light", "tube light", "bulb",
                "switch", "socket", "plug", "mcb", "power", "fuse", "blackout", "electricity",
                "voltage", "surge", "generator", "ac unit", "air conditioner"
        ));
        DEPARTMENT_ASSIGNMENTS.put(Category.ELECTRICAL, "Maintenance - Electrical Team");

        CATEGORY_KEYWORDS.put(Category.WATER_SUPPLY, Arrays.asList(
                "leak", "pipe", "tap", "faucet", "water", "cooler", "filter", "overflow",
                "sewage", "drain", "choked", "flush", "washroom water", "tank", "plumbing"
        ));
        DEPARTMENT_ASSIGNMENTS.put(Category.WATER_SUPPLY, "Plumbing Dept");

        CATEGORY_KEYWORDS.put(Category.CLEANLINESS, Arrays.asList(
                "dust", "garbage", "trash", "waste", "bin", "smell", "odor", "stain",
                "dirty", "mop", "sweep", "washroom dirty", "hygiene", "cockroach", "pest"
        ));
        DEPARTMENT_ASSIGNMENTS.put(Category.CLEANLINESS, "Housekeeping Supervisor");

        CATEGORY_KEYWORDS.put(Category.HOSTEL_MAINTENANCE, Arrays.asList(
                "bed", "cupboard", "almirah", "window", "door", "lock", "key", "latch",
                "hostel room", "balcony", "curtain", "mattress", "room ceiling", "wardrobe"
        ));
        DEPARTMENT_ASSIGNMENTS.put(Category.HOSTEL_MAINTENANCE, "Carpentry & Hostel Unit");

        CATEGORY_KEYWORDS.put(Category.INTERNET_IT, Arrays.asList(
                "wifi", "wi-fi", "internet", "network", "lan", "ethernet", "router", "switch",
                "ap-", "access point", "port", "dns", "signal", "speed", "portal", "server"
        ));
        DEPARTMENT_ASSIGNMENTS.put(Category.INTERNET_IT, "Campus IT Network Cell");

        CATEGORY_KEYWORDS.put(Category.LABORATORY_EQUIPMENT, Arrays.asList(
                "oscilloscope", "multimeter", "microscope", "bunsen", "sensor", "workbench",
                "instrument", "apparatus", "fume hood", "chemical", "pipette", "centrifuge"
        ));
        DEPARTMENT_ASSIGNMENTS.put(Category.LABORATORY_EQUIPMENT, "Lab Safety & Instrumentation");

        CATEGORY_KEYWORDS.put(Category.INFRASTRUCTURE, Arrays.asList(
                "ramp", "pothole", "road", "pathway", "tile", "plaster", "crack", "staircase",
                "handrail", "roof leak", "wall paint", "bench", "auditorium seat", "pillar"
        ));
        DEPARTMENT_ASSIGNMENTS.put(Category.INFRASTRUCTURE, "Estate Office - Civil Wing");

        CATEGORY_KEYWORDS.put(Category.OTHER, Arrays.asList(
                "vending machine", "canteen", "lost", "noise", "parking", "notice board"
        ));
        DEPARTMENT_ASSIGNMENTS.put(Category.OTHER, "General Campus Administration");
    }

    public AiClassificationResult classify(String description, String location) {
        String combined = ((description != null ? description : "") + " " + (location != null ? location : "")).toLowerCase();

        Category bestCategory = Category.OTHER;
        int maxScore = 0;

        for (Category cat : Category.values()) {
            List<String> keywords = CATEGORY_KEYWORDS.get(cat);
            if (keywords != null) {
                int score = 0;
                for (String kw : keywords) {
                    if (combined.contains(kw)) {
                        score += 2;
                    }
                }
                if (score > maxScore) {
                    maxScore = score;
                    bestCategory = cat;
                }
            }
        }

        String priority = "Medium";
        for (String kw : HIGH_PRIORITY_KEYWORDS) {
            if (combined.contains(kw)) {
                priority = "High";
                break;
            }
        }
        if ("Medium".equals(priority)) {
            for (String kw : LOW_PRIORITY_KEYWORDS) {
                if (combined.contains(kw) && maxScore < 4) {
                    priority = "Low";
                    break;
                }
            }
        }

        double confidence = maxScore > 0 ? Math.min(0.96, 0.60 + (maxScore * 0.08)) : 0.50;
        confidence = Math.round(confidence * 100.0) / 100.0;

        String assignedTeam = DEPARTMENT_ASSIGNMENTS.getOrDefault(bestCategory, "Campus Facilities Helpdesk");
        String reasoning = "Auto-triaged facility keywords mapped to " + bestCategory.getDisplayName() + ".";
        if ("High".equals(priority)) {
            reasoning += " Priority elevated to High due to critical safety or campus disruption indicator.";
        }

        return new AiClassificationResult(bestCategory.getDisplayName(), priority, confidence, assignedTeam, reasoning);
    }

    public List<Complaint> findPotentialDuplicates(List<Complaint> activeComplaints, String category, String location) {
        if (location == null || location.trim().length() < 3 || activeComplaints == null) {
            return Collections.emptyList();
        }

        List<Complaint> duplicates = new ArrayList<>();
        for (Complaint c : activeComplaints) {
            if ("Resolved".equalsIgnoreCase(c.getStatus()) || "Rejected".equalsIgnoreCase(c.getStatus())) {
                continue;
            }
            if (category != null && !category.equalsIgnoreCase(c.getCategory())) {
                continue;
            }
            if (TextSimilarity.matchesLocation(location, c.getLocation())) {
                duplicates.add(c);
            }
        }
        return duplicates;
    }
}
