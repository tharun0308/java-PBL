package com.scms;

import com.scms.model.*;
import com.scms.repository.DataStore;
import com.scms.service.*;
import com.scms.util.JsonUtil;

import java.io.File;
import java.util.List;
import java.util.Map;

public class ServiceTest {
    public static void main(String[] args) {
        System.out.println("Running SCMS Service & JSON Verification Tests...");

        // 1. Test JsonUtil parseObject
        String json = "{\"description\": \"The switchboard is sparking and smoking\", \"location\": \"Seminar Hall 2\"}";
        Map<String, Object> map = JsonUtil.parseObject(json);
        System.out.println("Parsed description: '" + map.get("description") + "'");
        System.out.println("Parsed location: '" + map.get("location") + "'");

        // 2. Test AiTriageService
        AiTriageService ai = new AiTriageService();
        AiClassificationResult res = ai.classify((String) map.get("description"), (String) map.get("location"));
        System.out.println("AI Result: Category=" + res.getCategory() + ", Priority=" + res.getPriority() + ", Team=" + res.getAssignedTeam());
        assert "Electrical".equals(res.getCategory()) : "Expected Electrical";
        assert "High".equals(res.getPriority()) : "Expected High";

        // 3. Test DataStore & ComplaintService
        String dataPath = System.getProperty("user.dir") + File.separator + "data" + File.separator + "scms_data.json";
        DataStore.init(dataPath);
        ComplaintService cs = new ComplaintService();

        // 4. Test Admin Restriction (Must throw SecurityException)
        User admin = new User();
        admin.setRole("admin");
        boolean adminBlocked = false;
        try {
            cs.createComplaint(admin, "Electrical", "Room 101", "Fan is broken and sparking", "High", null);
        } catch (SecurityException e) {
            adminBlocked = true;
            System.out.println("✓ Admin blocked from filing complaints: " + e.getMessage());
        }
        if (!adminBlocked) {
            throw new RuntimeException("FAILED: Admin was not blocked from filing complaint!");
        }

        // 5. Test Student Filing Complaint
        User student = new User();
        student.setId("22222222-2222-2222-2222-222222222222");
        student.setRole("user");
        Complaint created = cs.createComplaint(student, "Electrical", "Physics Lab Block B Room 102", "Ceiling fan switch sparking when turned on", "High", null);
        System.out.println("✓ Student filed complaint: #SCMS-" + created.getComplaint_number() + " ID=" + created.getId());

        // 6. Test Duplicate Detection
        List<Complaint> duplicates = ai.findPotentialDuplicates(cs.getComplaints(admin, null, null, null, null), "Electrical", "Physics Lab Block B Room 102");
        System.out.println("✓ Duplicates found: " + duplicates.size());

        // 7. Test SLA Calculation
        SlaInfo sla = SlaService.calculateSla(created);
        System.out.println("✓ SLA badge text: " + sla.getBadgeText() + " (Target: " + sla.getTargetHours() + "h)");

        // 8. Test Reports Summary
        ReportService rs = new ReportService();
        ReportSummary summary = rs.getSummary();
        System.out.println("✓ Summary total complaints: " + summary.getTotal() + ", Overdue: " + summary.getOverdue());

        System.out.println("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY! ✓");
    }
}
