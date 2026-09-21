package com.scms.model;

/**
 * Result returned by the AI Auto-Triage inference engine.
 */
public class AiClassificationResult {
    private String category;
    private String priority;
    private double confidence;
    private String assignedTeam;
    private String reasoning;

    public AiClassificationResult() {}

    public AiClassificationResult(String category, String priority, double confidence, String assignedTeam, String reasoning) {
        this.category = category;
        this.priority = priority;
        this.confidence = confidence;
        this.assignedTeam = assignedTeam;
        this.reasoning = reasoning;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public String getAssignedTeam() {
        return assignedTeam;
    }

    public void setAssignedTeam(String assignedTeam) {
        this.assignedTeam = assignedTeam;
    }

    public String getReasoning() {
        return reasoning;
    }

    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }
}
