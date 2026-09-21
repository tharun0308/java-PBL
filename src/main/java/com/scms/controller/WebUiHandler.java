package com.scms.controller;

import com.scms.model.User;
import com.scms.service.AuthService;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * Controller serving the complete, multi-module SCMS Application directly from Java.
 * Fully supports:
 * - /login: Authentication portal with Demo Student & Demo Administrator buttons
 * - /dashboard: Student Module with 5 KPI cards, 4-stage live visual tracker, and photo preview
 * - /complaints/new: Student complaint submission with AI Auto-classify and duplicate alert
 * - /admin/dashboard: Admin Module with Recharts-like SVG analytics, KPI metrics, and satisfaction scores
 * - /admin/complaints: Admin Triage Module with Evidence/Attachments column, inspection modal, and quick status changes
 */
public class WebUiHandler extends BaseHttpHandler {

    public WebUiHandler(AuthService authService) {
        super(authService);
    }

    @Override
    protected void process(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        if (path.startsWith("/api/")) {
            sendError(exchange, 404, "API route not found");
            return;
        }

        Optional<User> userOpt = getAuthenticatedUser(exchange);

        // Root redirect logic
        if ("/".equals(path) || path.isEmpty()) {
            if (userOpt.isPresent()) {
                String redirectUrl = userOpt.get().isAdmin() ? "/admin/dashboard" : "/dashboard";
                exchange.getResponseHeaders().set("Location", redirectUrl);
                exchange.sendResponseHeaders(302, -1);
                return;
            } else {
                exchange.getResponseHeaders().set("Location", "/login");
                exchange.sendResponseHeaders(302, -1);
                return;
            }
        }

        // Role boundary protection: if admin attempts to access /complaints/new
        if ("/complaints/new".equals(path) && userOpt.isPresent() && userOpt.get().isAdmin()) {
            exchange.getResponseHeaders().set("Location", "/admin/dashboard");
            exchange.sendResponseHeaders(302, -1);
            return;
        }

        // If not logged in and requesting protected page, redirect to /login
        if (userOpt.isEmpty() && !"/login".equals(path)) {
            exchange.getResponseHeaders().set("Location", "/login?redirectTo=" + path);
            exchange.sendResponseHeaders(302, -1);
            return;
        }

        User user = userOpt.orElseGet(() -> {
            User demo = new User();
            demo.setId("guest");
            demo.setRole("guest");
            demo.setFull_name("Guest");
            demo.setEmail("");
            return demo;
        });

        String html = renderPage(path, user);
        byte[] bytes = html.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
        if ("HEAD".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(200, bytes.length);
            return;
        }
        exchange.sendResponseHeaders(200, bytes.length);

        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private String renderPage(String path, User user) {
        String activeTab = "dashboard";
        if (path.startsWith("/admin/dashboard")) activeTab = "admin-dashboard";
        else if (path.startsWith("/admin/complaints")) activeTab = "admin-complaints";
        else if (path.startsWith("/complaints/new")) activeTab = "complaints-new";
        else if (path.startsWith("/login")) activeTab = "login";

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>\n")
          .append("<html lang=\"en\" class=\"light\">\n")
          .append("<head>\n")
          .append("  <meta charset=\"UTF-8\" />\n")
          .append("  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n")
          .append("  <title>SCMS — Smart Complaint Management System</title>\n")
          .append("  <style>\n")
          .append(getCommonCss())
          .append("  </style>\n")
          .append("</head>\n")
          .append("<body>\n");

        if (!"login".equals(activeTab)) {
            sb.append(renderNavbar(user, activeTab));
        }

        sb.append("  <main class=\"main-container\">\n");

        if ("login".equals(activeTab)) {
            sb.append(renderLoginView());
        } else if ("admin-dashboard".equals(activeTab)) {
            sb.append(renderAdminDashboardView(user));
        } else if ("admin-complaints".equals(activeTab)) {
            sb.append(renderAdminComplaintsView(user));
        } else if ("complaints-new".equals(activeTab)) {
            sb.append(renderNewComplaintView(user));
        } else {
            sb.append(renderStudentDashboardView(user));
        }

        sb.append("  </main>\n")
          .append(renderModals())
          .append("  <script>\n")
          .append(getCommonJs(user))
          .append("  </script>\n")
          .append("</body>\n")
          .append("</html>");

        return sb.toString();
    }

    private String escapeHtml(String str) {
        if (str == null) return "";
        return str.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    private String renderNavbar(User user, String activeTab) {
        boolean isAdmin = user.isAdmin();
        return "  <nav class=\"navbar\">\n" +
                "    <div class=\"nav-left\">\n" +
                "      <a href=\"" + (isAdmin ? "/admin/dashboard" : "/dashboard") + "\" class=\"logo-link\">\n" +
                "        <div class=\"logo-icon\">S</div>\n" +
                "        <div>\n" +
                "          <div class=\"logo-title\">SCMS</div>\n" +
                "          <div class=\"logo-sub\">Campus Facility System</div>\n" +
                "        </div>\n" +
                "      </a>\n" +
                "      <div class=\"nav-links\">\n" +
                (isAdmin
                        ? "        <a href=\"/admin/complaints\" class=\"nav-link " + ("admin-complaints".equals(activeTab) ? "active" : "") + "\">Facilities Triage</a>\n" +
                          "        <a href=\"/admin/dashboard\" class=\"nav-link " + ("admin-dashboard".equals(activeTab) ? "active" : "") + "\">Analytics Dashboard</a>\n"
                        : "        <a href=\"/dashboard\" class=\"nav-link " + ("dashboard".equals(activeTab) ? "active" : "") + "\">My Complaints</a>\n" +
                          "        <a href=\"/complaints/new\" class=\"nav-link " + ("complaints-new".equals(activeTab) ? "active" : "") + "\">New Complaint</a>\n"
                ) +
                "      </div>\n" +
                "    </div>\n" +
                "    <div class=\"nav-right\">\n" +
                "      <button class=\"btn btn-ghost btn-icon\" id=\"themeToggleBtn\" onclick=\"toggleTheme()\" title=\"Toggle Dark/Light Mode\">🌙</button>\n" +
                "      <div class=\"notif-wrapper\">\n" +
                "        <button class=\"btn btn-ghost btn-icon notif-btn\" onclick=\"toggleNotifications()\" title=\"Notifications\">\n" +
                "          🔔<span class=\"notif-badge\" id=\"notifBadge\" style=\"display:none;\">0</span>\n" +
                "        </button>\n" +
                "        <div class=\"notif-dropdown\" id=\"notifDropdown\">\n" +
                "          <div class=\"notif-header\">\n" +
                "            <span>Notifications</span>\n" +
                "            <button class=\"btn-link\" onclick=\"markNotificationsRead()\">Mark all read</button>\n" +
                "          </div>\n" +
                "          <div class=\"notif-body\" id=\"notifBody\">No new notifications.</div>\n" +
                "        </div>\n" +
                "      </div>\n" +
                "      <div class=\"user-pill\">\n" +
                "        <div class=\"avatar\">" + (user.getFull_name() != null && !user.getFull_name().isEmpty() ? user.getFull_name().substring(0, 1) : "U") + "</div>\n" +
                "        <div class=\"user-info\">\n" +
                "          <span class=\"user-name\">" + escapeHtml(user.getFull_name()) + "</span>\n" +
                "          <span class=\"user-role badge-" + (isAdmin ? "admin" : "student") + "\">" + (isAdmin ? "Administrator" : "Student") + "</span>\n" +
                "        </div>\n" +
                "      </div>\n" +
                "      <button class=\"btn btn-outline btn-sm\" onclick=\"logout()\">Sign Out</button>\n" +
                "    </div>\n" +
                "  </nav>\n";
    }

    private String renderLoginView() {
        return "  <div class=\"login-wrapper\">\n" +
                "    <div class=\"login-card\">\n" +
                "      <div class=\"login-header\">\n" +
                "        <div class=\"logo-icon lg\">S</div>\n" +
                "        <h2>SCMS</h2>\n" +
                "        <p>Smart Complaint Management System</p>\n" +
                "      </div>\n" +
                "      <div id=\"loginAlert\" class=\"alert alert-danger\" style=\"display:none;\"></div>\n" +
                "      <form onsubmit=\"handleLoginSubmit(event)\" class=\"login-form\">\n" +
                "        <div class=\"form-group\">\n" +
                "          <label>Email Address</label>\n" +
                "          <input type=\"email\" id=\"loginEmail\" placeholder=\"name@college.edu\" required />\n" +
                "        </div>\n" +
                "        <div class=\"form-group\">\n" +
                "          <label>Password</label>\n" +
                "          <input type=\"password\" id=\"loginPassword\" placeholder=\"••••••••\" required />\n" +
                "        </div>\n" +
                "        <button type=\"submit\" class=\"btn btn-primary btn-block\">Sign In</button>\n" +
                "      </form>\n" +
                "      <div class=\"demo-box\">\n" +
                "        <div class=\"demo-title\">✨ Quick Demo Fill (Pre-loaded in Database):</div>\n" +
                "        <div class=\"demo-buttons\">\n" +
                "          <button type=\"button\" class=\"btn btn-outline btn-demo\" onclick=\"fillDemo('student')\">Demo Student</button>\n" +
                "          <button type=\"button\" class=\"btn btn-outline btn-demo admin\" onclick=\"fillDemo('admin')\">Demo Administrator</button>\n" +
                "        </div>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "  </div>\n";
    }

    private String renderStudentDashboardView(User user) {
        return "  <div class=\"page-header\">\n" +
                "    <div>\n" +
                "      <h1 class=\"page-title\">My Complaints Dashboard</h1>\n" +
                "      <p class=\"page-sub\">Track and monitor your campus facility reports in real-time</p>\n" +
                "    </div>\n" +
                "    <a href=\"/complaints/new\" class=\"btn btn-primary\">➕ New Complaint</a>\n" +
                "  </div>\n" +
                "  <!-- 5 KPI Cards -->\n" +
                "  <div class=\"kpi-grid\">\n" +
                "    <div class=\"kpi-card\">\n" +
                "      <span class=\"kpi-label\">Total Complaints</span>\n" +
                "      <span class=\"kpi-value\" id=\"kpiTotal\">0</span>\n" +
                "      <span class=\"kpi-desc\">Active & resolved</span>\n" +
                "    </div>\n" +
                "    <div class=\"kpi-card warning\">\n" +
                "      <span class=\"kpi-label\">Pending Review</span>\n" +
                "      <span class=\"kpi-value\" id=\"kpiPending\">0</span>\n" +
                "      <span class=\"kpi-desc\">Awaiting triage</span>\n" +
                "    </div>\n" +
                "    <div class=\"kpi-card info\">\n" +
                "      <span class=\"kpi-label\">In Progress</span>\n" +
                "      <span class=\"kpi-value\" id=\"kpiInProgress\">0</span>\n" +
                "      <span class=\"kpi-desc\">Assigned to staff</span>\n" +
                "    </div>\n" +
                "    <div class=\"kpi-card success\">\n" +
                "      <span class=\"kpi-label\">Resolved</span>\n" +
                "      <span class=\"kpi-value\" id=\"kpiResolved\">0</span>\n" +
                "      <span class=\"kpi-desc\">Closed issues</span>\n" +
                "    </div>\n" +
                "    <div class=\"kpi-card danger\">\n" +
                "      <span class=\"kpi-label\">Overdue / Urgent</span>\n" +
                "      <span class=\"kpi-value\" id=\"kpiOverdue\">0</span>\n" +
                "      <span class=\"kpi-desc\">SLA deadline passed</span>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "  <!-- Filters Bar -->\n" +
                "  <div class=\"filter-bar\">\n" +
                "    <input type=\"text\" id=\"searchInput\" placeholder=\"🔍 Search location, description, or #...\" oninput=\"debounceSearch()\" class=\"search-input\" />\n" +
                "    <select id=\"statusFilter\" onchange=\"loadStudentComplaints()\">\n" +
                "      <option value=\"all\">All Statuses</option>\n" +
                "      <option value=\"Pending\">Pending</option>\n" +
                "      <option value=\"In Progress\">In Progress</option>\n" +
                "      <option value=\"Resolved\">Resolved</option>\n" +
                "      <option value=\"Rejected\">Rejected</option>\n" +
                "    </select>\n" +
                "    <select id=\"categoryFilter\" onchange=\"loadStudentComplaints()\">\n" +
                "      <option value=\"all\">All Categories</option>\n" +
                "      <option value=\"Electrical\">Electrical</option>\n" +
                "      <option value=\"Water Supply\">Water Supply</option>\n" +
                "      <option value=\"Cleanliness\">Cleanliness</option>\n" +
                "      <option value=\"Internet/IT\">Internet/IT</option>\n" +
                "      <option value=\"Hostel Maintenance\">Hostel Maintenance</option>\n" +
                "      <option value=\"Laboratory Equipment\">Laboratory Equipment</option>\n" +
                "      <option value=\"Infrastructure\">Infrastructure</option>\n" +
                "      <option value=\"Other\">Other</option>\n" +
                "    </select>\n" +
                "    <select id=\"priorityFilter\" onchange=\"loadStudentComplaints()\">\n" +
                "      <option value=\"all\">All Priorities</option>\n" +
                "      <option value=\"High\">High</option>\n" +
                "      <option value=\"Medium\">Medium</option>\n" +
                "      <option value=\"Low\">Low</option>\n" +
                "    </select>\n" +
                "    <button class=\"btn btn-outline btn-sm\" onclick=\"resetFilters()\">Reset Filters</button>\n" +
                "  </div>\n" +
                "  <!-- Complaints Feed -->\n" +
                "  <div id=\"complaintsContainer\" class=\"complaints-feed\">\n" +
                "    <div class=\"loading-box\">Loading complaints from Java backend...</div>\n" +
                "  </div>\n";
    }

    private String renderNewComplaintView(User user) {
        return "  <div class=\"form-page-wrapper\">\n" +
                "    <div class=\"form-card\">\n" +
                "      <div class=\"card-header\">\n" +
                "        <h2>Register Facility Complaint</h2>\n" +
                "        <p>Submit defect report for maintenance dispatch and tracking</p>\n" +
                "      </div>\n" +
                "      <!-- Duplicate Alert Banner -->\n" +
                "      <div id=\"duplicateAlert\" class=\"alert alert-warning\" style=\"display:none;\">\n" +
                "        ⚠️ <strong>Duplicate Warning:</strong> A complaint has already been submitted for this location.\n" +
                "      </div>\n" +
                "      <form onsubmit=\"handleComplaintSubmit(event)\" class=\"complaint-form\">\n" +
                "        <div class=\"form-group\">\n" +
                "          <label>Facility Category <span class=\"req\">*</span></label>\n" +
                "          <select id=\"newCategory\" required>\n" +
                "            <option value=\"Electrical\">Electrical</option>\n" +
                "            <option value=\"Water Supply\">Water Supply</option>\n" +
                "            <option value=\"Cleanliness\">Cleanliness</option>\n" +
                "            <option value=\"Internet/IT\">Internet/IT</option>\n" +
                "            <option value=\"Hostel Maintenance\">Hostel Maintenance</option>\n" +
                "            <option value=\"Laboratory Equipment\">Laboratory Equipment</option>\n" +
                "            <option value=\"Infrastructure\">Infrastructure</option>\n" +
                "            <option value=\"Other\">Other</option>\n" +
                "          </select>\n" +
                "        </div>\n" +
                "        <div class=\"form-group\">\n" +
                "          <label>Location (e.g. Block B, 3rd Floor, Room 304) <span class=\"req\">*</span></label>\n" +
                "          <input type=\"text\" id=\"newLocation\" placeholder=\"Specific building, wing, room number\" onblur=\"checkDuplicateLocation()\" required />\n" +
                "        </div>\n" +
                "        <div class=\"form-group\">\n" +
                "          <div class=\"label-row\">\n" +
                "            <label>Detailed Description <span class=\"req\">*</span></label>\n" +
                "            <button type=\"button\" class=\"btn btn-outline btn-xs\" onclick=\"triggerAiClassify()\">✨ AI Auto-Classify</button>\n" +
                "          </div>\n" +
                "          <textarea id=\"newDescription\" rows=\"4\" placeholder=\"Describe what went wrong, safety concerns, or equipment defect...\" required></textarea>\n" +
                "          <div id=\"aiResultBanner\" class=\"ai-banner\" style=\"display:none;\"></div>\n" +
                "        </div>\n" +
                "        <div class=\"form-group\">\n" +
                "          <label>Urgency / Priority Level <span class=\"req\">*</span></label>\n" +
                "          <select id=\"newPriority\">\n" +
                "            <option value=\"Medium\">Medium (48h Turnaround)</option>\n" +
                "            <option value=\"High\">High (24h Urgent / Safety Risk)</option>\n" +
                "            <option value=\"Low\">Low (120h Routine)</option>\n" +
                "          </select>\n" +
                "        </div>\n" +
                "        <div class=\"form-group\">\n" +
                "          <label>Photo Evidence URL (Optional)</label>\n" +
                "          <input type=\"text\" id=\"newImageUrl\" placeholder=\"https://images.unsplash.com/... or data URL\" oninput=\"updatePhotoPreview()\" />\n" +
                "          <div id=\"photoPreviewBox\" style=\"margin-top:0.5rem; display:none;\">\n" +
                "            <img id=\"formPhotoPreview\" src=\"\" style=\"max-height: 120px; border-radius: 8px; border: 1px solid var(--border-color);\" />\n" +
                "          </div>\n" +
                "        </div>\n" +
                "        <div class=\"form-actions\">\n" +
                "          <a href=\"/dashboard\" class=\"btn btn-outline\">Cancel</a>\n" +
                "          <button type=\"submit\" class=\"btn btn-primary\">Submit Complaint</button>\n" +
                "        </div>\n" +
                "      </form>\n" +
                "    </div>\n" +
                "  </div>\n";
    }

    private String renderAdminDashboardView(User user) {
        return "  <div class=\"page-header\">\n" +
                "    <div>\n" +
                "      <h1 class=\"page-title\">Facilities Operations & Analytics Dashboard</h1>\n" +
                "      <p class=\"page-sub\">Administrative reporting, SLA tracking, and campus facility distribution</p>\n" +
                "    </div>\n" +
                "    <div class=\"header-actions\">\n" +
                "      <button class=\"btn btn-outline\" onclick=\"exportCsv()\">📥 Export Master CSV</button>\n" +
                "      <a href=\"/admin/complaints\" class=\"btn btn-primary\">Go to Complaints Triage</a>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "  <!-- 5 KPI Cards -->\n" +
                "  <div class=\"kpi-grid\">\n" +
                "    <div class=\"kpi-card\">\n" +
                "      <span class=\"kpi-label\">Total Complaints</span>\n" +
                "      <span class=\"kpi-value\" id=\"kpiTotal\">0</span>\n" +
                "      <span class=\"kpi-desc\">Logged in database</span>\n" +
                "    </div>\n" +
                "    <div class=\"kpi-card warning\">\n" +
                "      <span class=\"kpi-label\">Pending Triage</span>\n" +
                "      <span class=\"kpi-value\" id=\"kpiPending\">0</span>\n" +
                "      <span class=\"kpi-desc\">Require assignment</span>\n" +
                "    </div>\n" +
                "    <div class=\"kpi-card info\">\n" +
                "      <span class=\"kpi-label\">In Progress</span>\n" +
                "      <span class=\"kpi-value\" id=\"kpiInProgress\">0</span>\n" +
                "      <span class=\"kpi-desc\">Active technician jobs</span>\n" +
                "    </div>\n" +
                "    <div class=\"kpi-card success\">\n" +
                "      <span class=\"kpi-label\">Resolved</span>\n" +
                "      <span class=\"kpi-value\" id=\"kpiResolved\">0</span>\n" +
                "      <span class=\"kpi-desc\">Successfully repaired</span>\n" +
                "    </div>\n" +
                "    <div class=\"kpi-card danger\">\n" +
                "      <span class=\"kpi-label\">SLA Overdue</span>\n" +
                "      <span class=\"kpi-value\" id=\"kpiOverdue\">0</span>\n" +
                "      <span class=\"kpi-desc\">Action required immediately</span>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "  <!-- Analytics Visual Charts (SVG) -->\n" +
                "  <div class=\"analytics-grid\">\n" +
                "    <div class=\"chart-card\">\n" +
                "      <div class=\"chart-header\">\n" +
                "        <h3>Category Breakdown</h3>\n" +
                "        <span class=\"chart-subtitle\">Complaints volume by campus department</span>\n" +
                "      </div>\n" +
                "      <div id=\"categoryChartBox\" class=\"chart-body\">Loading category distribution...</div>\n" +
                "    </div>\n" +
                "    <div class=\"chart-card\">\n" +
                "      <div class=\"chart-header\">\n" +
                "        <h3>Campus Satisfaction Rating</h3>\n" +
                "        <span class=\"chart-subtitle\">Verified student resolution reviews</span>\n" +
                "      </div>\n" +
                "      <div class=\"satisfaction-box\">\n" +
                "        <div class=\"satisfaction-score\" id=\"satScore\">4.8</div>\n" +
                "        <div class=\"satisfaction-stars\" id=\"satStars\">★★★★★</div>\n" +
                "        <div class=\"satisfaction-text\" id=\"satTotal\">Based on verified student reviews</div>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "  </div>\n";
    }

    private String renderAdminComplaintsView(User user) {
        return "  <div class=\"page-header\">\n" +
                "    <div>\n" +
                "      <h1 class=\"page-title\">Campus Facility Complaints Triage</h1>\n" +
                "      <p class=\"page-sub\">Review incoming complaints, inspect evidence attachments, and dispatch maintenance crews</p>\n" +
                "    </div>\n" +
                "    <div class=\"header-actions\">\n" +
                "      <button class=\"btn btn-outline\" onclick=\"exportCsv()\">📥 Export CSV</button>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "  <!-- Triage Filter Bar -->\n" +
                "  <div class=\"filter-bar\">\n" +
                "    <input type=\"text\" id=\"adminSearchInput\" placeholder=\"🔍 Search location, ticket #, description...\" oninput=\"debounceAdminSearch()\" class=\"search-input\" />\n" +
                "    <select id=\"adminStatusFilter\" onchange=\"loadAdminComplaints()\">\n" +
                "      <option value=\"all\">All Statuses</option>\n" +
                "      <option value=\"Pending\">Pending</option>\n" +
                "      <option value=\"In Progress\">In Progress</option>\n" +
                "      <option value=\"Resolved\">Resolved</option>\n" +
                "      <option value=\"Rejected\">Rejected</option>\n" +
                "    </select>\n" +
                "    <select id=\"adminCategoryFilter\" onchange=\"loadAdminComplaints()\">\n" +
                "      <option value=\"all\">All Categories</option>\n" +
                "      <option value=\"Electrical\">Electrical</option>\n" +
                "      <option value=\"Water Supply\">Water Supply</option>\n" +
                "      <option value=\"Cleanliness\">Cleanliness</option>\n" +
                "      <option value=\"Internet/IT\">Internet/IT</option>\n" +
                "      <option value=\"Hostel Maintenance\">Hostel Maintenance</option>\n" +
                "      <option value=\"Laboratory Equipment\">Laboratory Equipment</option>\n" +
                "      <option value=\"Infrastructure\">Infrastructure</option>\n" +
                "      <option value=\"Other\">Other</option>\n" +
                "    </select>\n" +
                "    <button class=\"btn btn-outline btn-sm\" onclick=\"resetAdminFilters()\">Reset Filters</button>\n" +
                "  </div>\n" +
                "  <!-- Complaints Table with Evidence Column -->\n" +
                "  <div class=\"table-card\">\n" +
                "    <table class=\"data-table\">\n" +
                "      <thead>\n" +
                "        <tr>\n" +
                "          <th>Ticket #</th>\n" +
                "          <th>Category</th>\n" +
                "          <th>Location</th>\n" +
                "          <th>Priority</th>\n" +
                "          <th>Status</th>\n" +
                "          <th>SLA Timer</th>\n" +
                "          <th>Evidence Attachment</th>\n" +
                "          <th>Actions</th>\n" +
                "        </tr>\n" +
                "      </thead>\n" +
                "      <tbody id=\"adminComplaintsTbody\">\n" +
                "        <tr><td colspan=\"8\" class=\"text-center\">Loading complaints...</td></tr>\n" +
                "      </tbody>\n" +
                "    </table>\n" +
                "  </div>\n";
    }

    private String renderModals() {
        return "  <!-- Photo Inspection Modal -->\n" +
                "  <div class=\"modal-overlay\" id=\"photoModal\" onclick=\"closeModal('photoModal')\">\n" +
                "    <div class=\"photo-modal-card\" onclick=\"event.stopPropagation()\">\n" +
                "      <div class=\"modal-header\">\n" +
                "        <h3 id=\"photoModalTitle\">Evidence Inspection</h3>\n" +
                "        <button class=\"btn btn-outline btn-xs\" onclick=\"closeModal('photoModal')\">✕</button>\n" +
                "      </div>\n" +
                "      <div class=\"photo-modal-body\">\n" +
                "        <img id=\"photoModalImg\" src=\"\" alt=\"Defect Evidence\" />\n" +
                "      </div>\n" +
                "      <div class=\"photo-modal-footer\">\n" +
                "        <a id=\"photoDownloadBtn\" href=\"\" target=\"_blank\" class=\"btn btn-outline btn-sm\">Open in New Tab</a>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "  <!-- Admin Triage / Status Update Modal -->\n" +
                "  <div class=\"modal-overlay\" id=\"triageModal\">\n" +
                "    <div class=\"modal-card\">\n" +
                "      <div class=\"modal-header\">\n" +
                "        <h3 id=\"triageModalTitle\">Update Complaint Status & Assignment</h3>\n" +
                "        <button class=\"btn btn-outline btn-xs\" onclick=\"closeModal('triageModal')\">✕</button>\n" +
                "      </div>\n" +
                "      <div class=\"form-group\">\n" +
                "        <label>Status</label>\n" +
                "        <select id=\"triageStatus\">\n" +
                "          <option value=\"Pending\">Pending</option>\n" +
                "          <option value=\"In Progress\">In Progress</option>\n" +
                "          <option value=\"Resolved\">Resolved</option>\n" +
                "          <option value=\"Rejected\">Rejected</option>\n" +
                "        </select>\n" +
                "      </div>\n" +
                "      <div class=\"form-group\">\n" +
                "        <label>Assigned Maintenance Crew / Technician</label>\n" +
                "        <input type=\"text\" id=\"triageAssignedTo\" placeholder=\"e.g. Maintenance - Electrical Team, Plumbing Dept\" />\n" +
                "      </div>\n" +
                "      <div class=\"form-group\">\n" +
                "        <label>Resolution Note</label>\n" +
                "        <textarea id=\"triageResolutionNote\" rows=\"3\" placeholder=\"Details of actions taken to resolve the issue...\"></textarea>\n" +
                "      </div>\n" +
                "      <div class=\"form-group\">\n" +
                "        <label>Resolution Proof Photo URL (Optional)</label>\n" +
                "        <input type=\"text\" id=\"triageResolutionImageUrl\" placeholder=\"https://images.unsplash.com/... or data URL\" />\n" +
                "      </div>\n" +
                "      <div class=\"form-actions\">\n" +
                "        <button class=\"btn btn-outline\" onclick=\"closeModal('triageModal')\">Cancel</button>\n" +
                "        <button class=\"btn btn-primary\" onclick=\"submitTriageUpdate()\">Save Changes</button>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "  <!-- Audit Trail Modal -->\n" +
                "  <div class=\"modal-overlay\" id=\"auditModal\">\n" +
                "    <div class=\"modal-card\">\n" +
                "      <div class=\"modal-header\">\n" +
                "        <h3 id=\"auditModalTitle\">Complaint History & Audit Log</h3>\n" +
                "        <button class=\"btn btn-outline btn-xs\" onclick=\"closeModal('auditModal')\">✕</button>\n" +
                "      </div>\n" +
                "      <div id=\"auditModalBody\" class=\"audit-timeline\"></div>\n" +
                "    </div>\n" +
                "  </div>\n";
    }

    private String getCommonCss() {
        return ":root {\n" +
                "  --bg-primary: #f8fafc;\n" +
                "  --bg-surface: #ffffff;\n" +
                "  --bg-surface-hover: #f1f5f9;\n" +
                "  --border-color: #e2e8f0;\n" +
                "  --text-main: #0f172a;\n" +
                "  --text-muted: #64748b;\n" +
                "  --primary: #4f46e5;\n" +
                "  --primary-hover: #4338ca;\n" +
                "  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);\n" +
                "  --radius: 12px;\n" +
                "}\n" +
                "html.dark {\n" +
                "  --bg-primary: #0b0f19;\n" +
                "  --bg-surface: #131b2e;\n" +
                "  --bg-surface-hover: #1e293b;\n" +
                "  --border-color: #27354f;\n" +
                "  --text-main: #f1f5f9;\n" +
                "  --text-muted: #94a3b8;\n" +
                "  --primary: #6366f1;\n" +
                "  --primary-hover: #4f46e5;\n" +
                "  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);\n" +
                "}\n" +
                "* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }\n" +
                "body { background: var(--bg-primary); color: var(--text-main); min-height: 100vh; display: flex; flex-direction: column; transition: background-color 0.2s; }\n" +
                ".navbar { background: var(--bg-surface); border-bottom: 1px solid var(--border-color); padding: 0.75rem 2rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 40; }\n" +
                ".nav-left, .nav-right { display: flex; align-items: center; gap: 1.5rem; }\n" +
                ".logo-link { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: var(--text-main); }\n" +
                ".logo-icon { width: 36px; height: 36px; border-radius: 9px; background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }\n" +
                ".logo-icon.lg { width: 48px; height: 48px; font-size: 1.5rem; border-radius: 12px; margin: 0 auto 0.5rem auto; }\n" +
                ".logo-title { font-weight: 800; font-size: 1.15rem; line-height: 1.1; }\n" +
                ".logo-sub { font-size: 0.75rem; color: var(--text-muted); }\n" +
                ".nav-links { display: flex; gap: 0.5rem; }\n" +
                ".nav-link { text-decoration: none; padding: 0.45rem 0.85rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; color: var(--text-muted); transition: all 0.15s; }\n" +
                ".nav-link:hover { color: var(--text-main); background: var(--bg-surface-hover); }\n" +
                ".nav-link.active { color: var(--primary); background: var(--bg-surface-hover); }\n" +
                ".btn { cursor: pointer; border: 1px solid transparent; border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; text-decoration: none; transition: all 0.15s; }\n" +
                ".btn-primary { background: var(--primary); color: white; }\n" +
                ".btn-primary:hover { background: var(--primary-hover); }\n" +
                ".btn-outline { background: transparent; border-color: var(--border-color); color: var(--text-main); }\n" +
                ".btn-outline:hover { background: var(--bg-surface-hover); }\n" +
                ".btn-ghost { background: transparent; border: none; color: var(--text-muted); }\n" +
                ".btn-ghost:hover { color: var(--text-main); background: var(--bg-surface-hover); }\n" +
                ".btn-icon { width: 36px; height: 36px; border-radius: 8px; padding: 0; justify-content: center; font-size: 1.1rem; }\n" +
                ".btn-sm { padding: 0.35rem 0.65rem; font-size: 0.8rem; }\n" +
                ".btn-xs { padding: 0.2rem 0.45rem; font-size: 0.75rem; }\n" +
                ".btn-block { width: 100%; justify-content: center; }\n" +
                ".user-pill { display: flex; align-items: center; gap: 0.6rem; padding: 0.25rem 0.6rem; border-radius: 9999px; background: var(--bg-surface-hover); }\n" +
                ".avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: white; font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; }\n" +
                ".user-info { display: flex; flex-direction: column; font-size: 0.75rem; }\n" +
                ".user-name { font-weight: 700; color: var(--text-main); }\n" +
                ".badge-admin { color: #9333ea; font-weight: 700; }\n" +
                ".badge-student { color: var(--primary); font-weight: 700; }\n" +
                ".main-container { max-width: 1240px; width: 100%; margin: 0 auto; padding: 2rem 1.5rem; flex: 1; }\n" +
                ".page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }\n" +
                ".page-title { font-size: 1.75rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em; }\n" +
                ".page-sub { font-size: 0.875rem; color: var(--text-muted); margin-top: 0.25rem; }\n" +
                ".header-actions { display: flex; gap: 0.75rem; }\n" +
                ".kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }\n" +
                ".kpi-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1.25rem; box-shadow: var(--card-shadow); display: flex; flex-direction: column; }\n" +
                ".kpi-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }\n" +
                ".kpi-value { font-size: 2.25rem; font-weight: 800; margin-top: 0.4rem; line-height: 1; }\n" +
                ".kpi-desc { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; }\n" +
                ".kpi-card.warning .kpi-value { color: #d97706; }\n" +
                ".kpi-card.info .kpi-value { color: #2563eb; }\n" +
                ".kpi-card.success .kpi-value { color: #16a34a; }\n" +
                ".kpi-card.danger .kpi-value { color: #dc2626; }\n" +
                ".filter-bar { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 0.85rem; margin-bottom: 1.75rem; display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }\n" +
                ".search-input, select, input[type='text'], input[type='email'], input[type='password'], textarea { background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.55rem 0.85rem; border-radius: 8px; font-size: 0.875rem; outline: none; transition: border-color 0.15s; }\n" +
                ".search-input { flex: 1; min-width: 200px; }\n" +
                ".search-input:focus, select:focus, textarea:focus, input:focus { border-color: var(--primary); }\n" +
                ".complaints-feed { display: flex; flex-direction: column; gap: 1.25rem; }\n" +
                ".tracker-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--card-shadow); display: flex; flex-direction: column; gap: 1.25rem; transition: transform 0.15s, box-shadow 0.15s; }\n" +
                ".tracker-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem; }\n" +
                ".ticket-header { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }\n" +
                ".ticket-id { font-size: 1.15rem; font-weight: 800; color: var(--text-main); }\n" +
                ".ticket-meta { display: flex; align-items: center; gap: 0.6rem; font-size: 0.8rem; color: var(--text-muted); margin-top: 0.35rem; }\n" +
                ".badge { padding: 0.25rem 0.65rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; border: 1px solid transparent; }\n" +
                ".badge-pending { background: #fef3c7; color: #92400e; border-color: #fde68a; }\n" +
                ".badge-in-progress { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }\n" +
                ".badge-resolved { background: #d1fae5; color: #065f46; border-color: #a7f3d0; }\n" +
                ".badge-rejected { background: #fee2e2; color: #991b1b; border-color: #fecaca; }\n" +
                ".badge-high { background: #fee2e2; color: #b91c1c; }\n" +
                ".badge-medium { background: #fef3c7; color: #b45309; }\n" +
                ".badge-low { background: #f1f5f9; color: #475569; }\n" +
                "/* 4-Stage Progress Tracker */\n" +
                ".tracker-pipeline { display: grid; grid-template-columns: repeat(4, 1fr); position: relative; margin: 0.75rem 0; }\n" +
                ".tracker-step { display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; z-index: 2; }\n" +
                ".tracker-circle { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.825rem; font-weight: 800; background: var(--bg-surface-hover); color: var(--text-muted); border: 2px solid var(--border-color); margin-bottom: 0.35rem; transition: all 0.2s; }\n" +
                ".tracker-circle.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.2); }\n" +
                ".tracker-circle.completed { background: #10b981; color: white; border-color: #10b981; }\n" +
                ".tracker-label { font-size: 0.775rem; font-weight: 600; color: var(--text-muted); }\n" +
                ".tracker-label.active { color: var(--text-main); font-weight: 700; }\n" +
                ".tracker-line { position: absolute; top: 17px; left: 12%; right: 12%; height: 3px; background: var(--border-color); z-index: 1; }\n" +
                ".tracker-line-fill { height: 100%; background: #10b981; transition: width 0.3s; }\n" +
                ".card-details-grid { display: grid; grid-template-columns: 1fr auto; gap: 1.5rem; align-items: center; }\n" +
                ".evidence-thumb { width: 96px; height: 72px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); cursor: pointer; transition: transform 0.15s; }\n" +
                ".evidence-thumb:hover { transform: scale(1.04); }\n" +
                ".rating-card { background: var(--bg-primary); border: 1px dashed var(--border-color); border-radius: 8px; padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }\n" +
                ".star-btn { cursor: pointer; font-size: 1.2rem; color: #cbd5e1; transition: color 0.15s; }\n" +
                ".star-btn.filled { color: #f59e0b; }\n" +
                "/* Form Views */\n" +
                ".form-page-wrapper { max-width: 680px; margin: 0 auto; }\n" +
                ".form-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 2rem; box-shadow: var(--card-shadow); }\n" +
                ".form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.25rem; }\n" +
                ".form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }\n" +
                ".req { color: #dc2626; }\n" +
                ".label-row { display: flex; justify-content: space-between; align-items: center; }\n" +
                ".form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }\n" +
                ".alert { padding: 0.85rem 1rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }\n" +
                ".alert-warning { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }\n" +
                ".alert-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }\n" +
                ".ai-banner { margin-top: 0.5rem; padding: 0.6rem 0.8rem; background: #e0e7ff; color: #3730a3; border-radius: 6px; font-size: 0.825rem; }\n" +
                "/* Analytics View */\n" +
                ".analytics-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-top: 1.5rem; }\n" +
                "@media(max-width: 768px) { .analytics-grid { grid-template-columns: 1fr; } }\n" +
                ".chart-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--card-shadow); }\n" +
                ".chart-header { margin-bottom: 1.25rem; }\n" +
                ".chart-header h3 { font-size: 1.15rem; font-weight: 700; }\n" +
                ".chart-subtitle { font-size: 0.8rem; color: var(--text-muted); }\n" +
                ".chart-bar-row { display: grid; grid-template-columns: 140px 1fr 40px; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; font-size: 0.85rem; }\n" +
                ".chart-bar-track { height: 18px; background: var(--bg-surface-hover); border-radius: 4px; overflow: hidden; }\n" +
                ".chart-bar-fill { height: 100%; background: linear-gradient(90deg, #4f46e5, #6366f1); border-radius: 4px; transition: width 0.4s ease; }\n" +
                ".satisfaction-box { text-align: center; padding: 2.5rem 1rem; display: flex; flex-direction: column; align-items: center; }\n" +
                ".satisfaction-score { font-size: 3.5rem; font-weight: 900; color: #f59e0b; line-height: 1; }\n" +
                ".satisfaction-stars { font-size: 1.75rem; color: #f59e0b; margin: 0.5rem 0; }\n" +
                ".satisfaction-text { font-size: 0.825rem; color: var(--text-muted); }\n" +
                "/* Tables */\n" +
                ".table-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius); overflow: hidden; box-shadow: var(--card-shadow); }\n" +
                ".data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem; }\n" +
                ".data-table th { background: var(--bg-surface-hover); padding: 0.85rem 1rem; font-weight: 700; color: var(--text-muted); border-bottom: 1px solid var(--border-color); }\n" +
                ".data-table td { padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; }\n" +
                ".data-table tr:hover td { background: var(--bg-surface-hover); }\n" +
                "/* Modals */\n" +
                ".modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); opacity: 0; pointer-events: none; transition: opacity 0.2s; }\n" +
                ".modal-overlay.open { opacity: 1; pointer-events: auto; }\n" +
                ".modal-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius); max-width: 540px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 1.75rem; }\n" +
                ".modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }\n" +
                ".photo-modal-card { background: var(--bg-surface); border-radius: 12px; max-width: 720px; width: 90%; overflow: hidden; padding: 1.25rem; }\n" +
                ".photo-modal-body { text-align: center; }\n" +
                ".photo-modal-body img { max-width: 100%; max-height: 70vh; border-radius: 8px; }\n" +
                ".photo-modal-footer { display: flex; justify-content: flex-end; margin-top: 1rem; }\n" +
                "/* Login */\n" +
                ".login-wrapper { min-height: 80vh; display: flex; align-items: center; justify-content: center; }\n" +
                ".login-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 16px; width: 100%; max-width: 420px; padding: 2.25rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }\n" +
                ".login-header { text-align: center; margin-bottom: 1.5rem; }\n" +
                ".login-header h2 { font-size: 1.5rem; font-weight: 800; }\n" +
                ".login-header p { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; }\n" +
                ".demo-box { margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color); }\n" +
                ".demo-title { font-size: 0.775rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.6rem; }\n" +
                ".demo-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }\n" +
                ".btn-demo { font-size: 0.8rem; justify-content: center; }\n" +
                ".btn-demo.admin { color: #9333ea; border-color: #e9d5ff; background: #faf5ff; }\n" +
                "/* Notifications Dropdown */\n" +
                ".notif-wrapper { position: relative; }\n" +
                ".notif-badge { position: absolute; top: 0; right: 0; background: #dc2626; color: white; font-size: 0.65rem; font-weight: 800; border-radius: 9999px; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; }\n" +
                ".notif-dropdown { position: absolute; right: 0; top: 46px; width: 320px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); display: none; z-index: 50; }\n" +
                ".notif-dropdown.open { display: block; }\n" +
                ".notif-header { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; }\n" +
                ".notif-body { max-height: 300px; overflow-y: auto; padding: 0.5rem; font-size: 0.8rem; }\n" +
                ".notif-item { padding: 0.6rem 0.75rem; border-radius: 8px; margin-bottom: 0.35rem; background: var(--bg-primary); }\n" +
                ".notif-item.unread { border-left: 3px solid var(--primary); }\n" +
                ".audit-timeline { display: flex; flex-direction: column; gap: 0.85rem; margin-top: 1rem; }\n" +
                ".audit-node { padding-left: 1rem; border-left: 2px solid var(--primary); font-size: 0.85rem; }\n";
    }

    private String getCommonJs(User user) {
        boolean isAdmin = user.isAdmin();
        return "let currentComplaintId = null;\n" +
                "let searchDebounce = null;\n" +
                "\n" +
                "function toggleTheme() {\n" +
                "  const el = document.documentElement;\n" +
                "  if (el.classList.contains('dark')) {\n" +
                "    el.classList.remove('dark');\n" +
                "    localStorage.setItem('scms_theme', 'light');\n" +
                "    document.getElementById('themeToggleBtn').textContent = '🌙';\n" +
                "  } else {\n" +
                "    el.classList.add('dark');\n" +
                "    localStorage.setItem('scms_theme', 'dark');\n" +
                "    document.getElementById('themeToggleBtn').textContent = '☀️';\n" +
                "  }\n" +
                "}\n" +
                "if (localStorage.getItem('scms_theme') === 'dark') {\n" +
                "  document.documentElement.classList.add('dark');\n" +
                "  const btn = document.getElementById('themeToggleBtn');\n" +
                "  if (btn) btn.textContent = '☀️';\n" +
                "}\n" +
                "\n" +
                "// Auth & Demo Helpers\n" +
                "function fillDemo(type) {\n" +
                "  if (type === 'admin') {\n" +
                "    document.getElementById('loginEmail').value = 'admin@college.edu';\n" +
                "    document.getElementById('loginPassword').value = 'Password123!';\n" +
                "  } else {\n" +
                "    document.getElementById('loginEmail').value = 'student@college.edu';\n" +
                "    document.getElementById('loginPassword').value = 'Password123!';\n" +
                "  }\n" +
                "}\n" +
                "\n" +
                "async function handleLoginSubmit(e) {\n" +
                "  e.preventDefault();\n" +
                "  const email = document.getElementById('loginEmail').value;\n" +
                "  const password = document.getElementById('loginPassword').value;\n" +
                "  const alertEl = document.getElementById('loginAlert');\n" +
                "  try {\n" +
                "    const res = await fetch('/api/auth/login', {\n" +
                "      method: 'POST',\n" +
                "      headers: { 'Content-Type': 'application/json' },\n" +
                "      body: JSON.stringify({ email, password })\n" +
                "    });\n" +
                "    const json = await res.json();\n" +
                "    if (res.ok) {\n" +
                "      if (json.user && json.user.role === 'admin') {\n" +
                "        window.location.href = '/admin/dashboard';\n" +
                "      } else {\n" +
                "        window.location.href = '/dashboard';\n" +
                "      }\n" +
                "    } else {\n" +
                "      alertEl.textContent = json.error || 'Login failed';\n" +
                "      alertEl.style.display = 'block';\n" +
                "    }\n" +
                "  } catch (err) {\n" +
                "    alertEl.textContent = err.message;\n" +
                "    alertEl.style.display = 'block';\n" +
                "  }\n" +
                "}\n" +
                "\n" +
                "async function logout() {\n" +
                "  await fetch('/api/auth/logout', { method: 'POST' });\n" +
                "  window.location.href = '/login';\n" +
                "}\n" +
                "\n" +
                "// Modals\n" +
                "function openModal(id) { document.getElementById(id).classList.add('open'); }\n" +
                "function closeModal(id) { document.getElementById(id).classList.remove('open'); }\n" +
                "\n" +
                "function inspectPhoto(url, title) {\n" +
                "  document.getElementById('photoModalImg').src = url;\n" +
                "  document.getElementById('photoModalTitle').textContent = title || 'Evidence Inspection';\n" +
                "  document.getElementById('photoDownloadBtn').href = url;\n" +
                "  openModal('photoModal');\n" +
                "}\n" +
                "\n" +
                "// Student Complaints Feed\n" +
                "async function loadStudentComplaints() {\n" +
                "  const container = document.getElementById('complaintsContainer');\n" +
                "  if (!container) return;\n" +
                "  const status = document.getElementById('statusFilter').value;\n" +
                "  const category = document.getElementById('categoryFilter').value;\n" +
                "  const priority = document.getElementById('priorityFilter').value;\n" +
                "  const search = document.getElementById('searchInput').value;\n" +
                "  let url = '/api/complaints?';\n" +
                "  if (status !== 'all') url += 'status=' + encodeURIComponent(status) + '&';\n" +
                "  if (category !== 'all') url += 'category=' + encodeURIComponent(category) + '&';\n" +
                "  if (priority !== 'all') url += 'priority=' + encodeURIComponent(priority) + '&';\n" +
                "  if (search) url += 'search=' + encodeURIComponent(search);\n" +
                "  try {\n" +
                "    const res = await fetch(url);\n" +
                "    const json = await res.json();\n" +
                "    renderStudentFeed(json.data || []);\n" +
                "  } catch (e) {\n" +
                "    container.innerHTML = '<div class=\"alert alert-danger\">Failed to load complaints.</div>';\n" +
                "  }\n" +
                "}\n" +
                "\n" +
                "function renderStudentFeed(list) {\n" +
                "  const container = document.getElementById('complaintsContainer');\n" +
                "  if (!list || list.length === 0) {\n" +
                "    container.innerHTML = '<div style=\"text-align:center; padding:3rem; color:var(--text-muted);\">No complaints found matching criteria.</div>';\n" +
                "    return;\n" +
                "  }\n" +
                "  container.innerHTML = list.map(c => {\n" +
                "    const num = String(c.complaint_number).padStart(4, '0');\n" +
                "    const step = getStepIndex(c.status);\n" +
                "    const sla = c.sla || {};\n" +
                "    return `\n" +
                "      <div class=\"tracker-card\">\n" +
                "        <div class=\"tracker-top\">\n" +
                "          <div>\n" +
                "            <div class=\"ticket-header\">\n" +
                "              <span class=\"ticket-id\">#SCMS-${num}</span>\n" +
                "              <span class=\"badge badge-${c.status.toLowerCase().replace(' ', '-')}\">${c.status}</span>\n" +
                "              <span class=\"badge badge-${c.priority.toLowerCase()}\">${c.priority} Priority</span>\n" +
                "              <span class=\"badge\" style=\"background:var(--bg-surface-hover); color:var(--text-muted); border-color:var(--border-color);\">${sla.badgeText || ''}</span>\n" +
                "            </div>\n" +
                "            <div class=\"ticket-meta\">\n" +
                "              <span>📍 <strong>${escapeHtml(c.location)}</strong></span>\n" +
                "              <span>•</span>\n" +
                "              <span>📁 ${escapeHtml(c.category)}</span>\n" +
                "              <span>•</span>\n" +
                "              <span>🕒 ${formatDate(c.created_at)}</span>\n" +
                "            </div>\n" +
                "          </div>\n" +
                "          <button class=\"btn btn-outline btn-sm\" onclick=\"openAuditModal('${c.id}')\">Audit Trail</button>\n" +
                "        </div>\n" +
                "        <!-- 4-Stage Visual Progress Tracker -->\n" +
                "        <div class=\"tracker-pipeline\">\n" +
                "          <div class=\"tracker-line\"><div class=\"tracker-line-fill\" style=\"width: ${step * 33.33}%\"></div></div>\n" +
                "          <div class=\"tracker-step\">\n" +
                "            <div class=\"tracker-circle ${step >= 0 ? 'completed' : ''}\">✓</div>\n" +
                "            <span class=\"tracker-label ${step === 0 ? 'active' : ''}\">Submitted</span>\n" +
                "          </div>\n" +
                "          <div class=\"tracker-step\">\n" +
                "            <div class=\"tracker-circle ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}\">${step > 1 ? '✓' : '2'}</div>\n" +
                "            <span class=\"tracker-label ${step === 1 ? 'active' : ''}\">Assigned</span>\n" +
                "          </div>\n" +
                "          <div class=\"tracker-step\">\n" +
                "            <div class=\"tracker-circle ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}\">${step > 2 ? '✓' : '3'}</div>\n" +
                "            <span class=\"tracker-label ${step === 2 ? 'active' : ''}\">In Progress</span>\n" +
                "          </div>\n" +
                "          <div class=\"tracker-step\">\n" +
                "            <div class=\"tracker-circle ${step === 3 ? 'completed' : ''}\">${step === 3 ? '✓' : '4'}</div>\n" +
                "            <span class=\"tracker-label ${step === 3 ? 'active' : ''}\">Resolved</span>\n" +
                "          </div>\n" +
                "        </div>\n" +
                "        <div class=\"card-details-grid\">\n" +
                "          <div>\n" +
                "            <p style=\"font-size:0.95rem; line-height:1.5;\">${escapeHtml(c.description)}</p>\n" +
                "            ${c.assigned_to ? `<div style=\"margin-top:0.4rem; font-size:0.825rem; color:var(--text-muted);\">👷 Assigned Unit: <strong>${escapeHtml(c.assigned_to)}</strong></div>` : ''}\n" +
                "            ${c.resolution_note ? `<div style=\"margin-top:0.35rem; font-size:0.825rem; color:#16a34a;\">✅ Resolution: ${escapeHtml(c.resolution_note)}</div>` : ''}\n" +
                "          </div>\n" +
                "          ${c.image_url ? `<img src=\"${escapeHtml(c.image_url)}\" class=\"evidence-thumb\" onclick=\"inspectPhoto('${escapeHtml(c.image_url)}', 'Evidence: #SCMS-${num}')\" title=\"Click to zoom evidence\" />` : ''}\n" +
                "        </div>\n" +
                "        <!-- Rating box if resolved -->\n" +
                "        ${c.status === 'Resolved' ? `\n" +
                "          <div class=\"rating-card\">\n" +
                "            <div>\n" +
                "              <strong>Student Satisfaction:</strong>\n" +
                "              <span style=\"margin-left:0.5rem;\">${renderStarRating(c.id, c.rating)}</span>\n" +
                "              ${c.feedback_note ? `<span style=\"margin-left:0.5rem; font-style:italic; font-size:0.85rem; color:var(--text-muted);\">\"${escapeHtml(c.feedback_note)}\"</span>` : ''}\n" +
                "            </div>\n" +
                "            ${!c.rating ? `<button class=\"btn btn-outline btn-xs\" onclick=\"promptRating('${c.id}')\">Add Review</button>` : ''}\n" +
                "          </div>\n" +
                "        ` : ''}\n" +
                "      </div>\n" +
                "    `;\n" +
                "  }).join('');\n" +
                "}\n" +
                "\n" +
                "function getStepIndex(status) {\n" +
                "  if (status === 'Resolved') return 3;\n" +
                "  if (status === 'In Progress') return 2;\n" +
                "  if (status === 'Pending') return 1;\n" +
                "  return 0;\n" +
                "}\n" +
                "\n" +
                "function renderStarRating(id, rating) {\n" +
                "  const r = rating || 0;\n" +
                "  let h = '';\n" +
                "  for (let i = 1; i <= 5; i++) {\n" +
                "    h += `<span class=\"star-btn ${i <= r ? 'filled' : ''}\" onclick=\"submitRating('${id}', ${i})\">★</span>`;\n" +
                "  }\n" +
                "  return h;\n" +
                "}\n" +
                "\n" +
                "async function submitRating(id, stars) {\n" +
                "  const note = prompt('Add an optional feedback comment:');\n" +
                "  if (note === null) return;\n" +
                "  await fetch(`/api/complaints/${id}/feedback`, {\n" +
                "    method: 'POST',\n" +
                "    headers: { 'Content-Type': 'application/json' },\n" +
                "    body: JSON.stringify({ rating: stars, feedback_note: note })\n" +
                "  });\n" +
                "  loadStudentComplaints();\n" +
                "  loadKpiMetrics();\n" +
                "}\n" +
                "\n" +
                "function promptRating(id) { submitRating(id, 5); }\n" +
                "\n" +
                "// KPI Metrics & Analytics\n" +
                "async function loadKpiMetrics() {\n" +
                "  try {\n" +
                "    const res = await fetch('/api/reports/summary');\n" +
                "    const json = await res.json();\n" +
                "    if (json.data) {\n" +
                "      const d = json.data;\n" +
                "      const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };\n" +
                "      setTxt('kpiTotal', d.total);\n" +
                "      setTxt('kpiPending', d.pending);\n" +
                "      setTxt('kpiInProgress', d.inProgress);\n" +
                "      setTxt('kpiResolved', d.resolved);\n" +
                "      setTxt('kpiOverdue', d.overdue);\n" +
                "      if (d.averageRating !== null) {\n" +
                "        setTxt('satScore', d.averageRating.toFixed(1));\n" +
                "        setTxt('satTotal', `Based on ${d.totalRatings} verified student reviews`);\n" +
                "      }\n" +
                "      renderCategoryBars(d.byCategory || []);\n" +
                "    }\n" +
                "  } catch (e) {}\n" +
                "}\n" +
                "\n" +
                "function renderCategoryBars(cats) {\n" +
                "  const box = document.getElementById('categoryChartBox');\n" +
                "  if (!box) return;\n" +
                "  const max = cats.reduce((m, c) => Math.max(m, c.count), 1);\n" +
                "  box.innerHTML = cats.map(c => `\n" +
                "    <div class=\"chart-bar-row\">\n" +
                "      <span style=\"font-weight:600;\">${c.category}</span>\n" +
                "      <div class=\"chart-bar-track\">\n" +
                "        <div class=\"chart-bar-fill\" style=\"width: ${(c.count / max) * 100}%\"></div>\n" +
                "      </div>\n" +
                "      <span style=\"text-align:right; font-weight:700;\">${c.count}</span>\n" +
                "    </div>\n" +
                "  `).join('');\n" +
                "}\n" +
                "\n" +
                "// Admin Complaints Table with Evidence Column\n" +
                "async function loadAdminComplaints() {\n" +
                "  const tbody = document.getElementById('adminComplaintsTbody');\n" +
                "  if (!tbody) return;\n" +
                "  const status = document.getElementById('adminStatusFilter').value;\n" +
                "  const category = document.getElementById('adminCategoryFilter').value;\n" +
                "  const search = document.getElementById('adminSearchInput').value;\n" +
                "  let url = '/api/complaints?';\n" +
                "  if (status !== 'all') url += 'status=' + encodeURIComponent(status) + '&';\n" +
                "  if (category !== 'all') url += 'category=' + encodeURIComponent(category) + '&';\n" +
                "  if (search) url += 'search=' + encodeURIComponent(search);\n" +
                "  try {\n" +
                "    const res = await fetch(url);\n" +
                "    const json = await res.json();\n" +
                "    renderAdminTable(json.data || []);\n" +
                "  } catch (e) {\n" +
                "    tbody.innerHTML = '<tr><td colspan=\"8\" class=\"text-center\">Failed to load complaints.</td></tr>';\n" +
                "  }\n" +
                "}\n" +
                "\n" +
                "function renderAdminTable(list) {\n" +
                "  const tbody = document.getElementById('adminComplaintsTbody');\n" +
                "  if (!list || list.length === 0) {\n" +
                "    tbody.innerHTML = '<tr><td colspan=\"8\" class=\"text-center\">No complaints found.</td></tr>';\n" +
                "    return;\n" +
                "  }\n" +
                "  tbody.innerHTML = list.map(c => {\n" +
                "    const num = String(c.complaint_number).padStart(4, '0');\n" +
                "    const sla = c.sla || {};\n" +
                "    return `\n" +
                "      <tr>\n" +
                "        <td><strong>#SCMS-${num}</strong></td>\n" +
                "        <td>${escapeHtml(c.category)}</td>\n" +
                "        <td>${escapeHtml(c.location)}</td>\n" +
                "        <td><span class=\"badge badge-${c.priority.toLowerCase()}\">${c.priority}</span></td>\n" +
                "        <td><span class=\"badge badge-${c.status.toLowerCase().replace(' ', '-')}\">${c.status}</span></td>\n" +
                "        <td><span class=\"badge\" style=\"background:var(--bg-surface-hover); color:var(--text-muted); border-color:var(--border-color);\">${sla.badgeText || ''}</span></td>\n" +
                "        <td>\n" +
                "          ${c.image_url ? `<button class=\"btn btn-outline btn-xs\" onclick=\"inspectPhoto('${escapeHtml(c.image_url)}', 'Evidence #SCMS-${num}')\">📷 Inspect Photo</button>` : '<span style=\"color:var(--text-muted); font-size:0.75rem;\">No Attachment</span>'}\n" +
                "        </td>\n" +
                "        <td>\n" +
                "          <button class=\"btn btn-primary btn-xs\" onclick=\"openTriageModal('${c.id}', '${c.status}', '${escapeHtml(c.assigned_to || '')}', '${escapeHtml(c.resolution_note || '')}')\">Update</button>\n" +
                "          <button class=\"btn btn-outline btn-xs\" onclick=\"openAuditModal('${c.id}')\">History</button>\n" +
                "        </td>\n" +
                "      </tr>\n" +
                "    `;\n" +
                "  }).join('');\n" +
                "}\n" +
                "\n" +
                "function openTriageModal(id, status, assignedTo, resNote) {\n" +
                "  currentComplaintId = id;\n" +
                "  document.getElementById('triageStatus').value = status;\n" +
                "  document.getElementById('triageAssignedTo').value = assignedTo;\n" +
                "  document.getElementById('triageResolutionNote').value = resNote;\n" +
                "  openModal('triageModal');\n" +
                "}\n" +
                "\n" +
                "async function submitTriageUpdate() {\n" +
                "  if (!currentComplaintId) return;\n" +
                "  const status = document.getElementById('triageStatus').value;\n" +
                "  const assigned_to = document.getElementById('triageAssignedTo').value;\n" +
                "  const resolution_note = document.getElementById('triageResolutionNote').value;\n" +
                "  const resolution_image_url = document.getElementById('triageResolutionImageUrl').value;\n" +
                "  await fetch(`/api/complaints/${currentComplaintId}/status`, {\n" +
                "    method: 'PATCH',\n" +
                "    headers: { 'Content-Type': 'application/json' },\n" +
                "    body: JSON.stringify({ status, assigned_to, resolution_note, resolution_image_url })\n" +
                "  });\n" +
                "  closeModal('triageModal');\n" +
                "  loadAdminComplaints();\n" +
                "}\n" +
                "\n" +
                "async function openAuditModal(id) {\n" +
                "  const body = document.getElementById('auditModalBody');\n" +
                "  body.innerHTML = 'Loading audit history...';\n" +
                "  openModal('auditModal');\n" +
                "  try {\n" +
                "    const res = await fetch(`/api/complaints/${id}`);\n" +
                "    const json = await res.json();\n" +
                "    const c = json.data;\n" +
                "    document.getElementById('auditModalTitle').textContent = `Audit Log: #SCMS-${String(c.complaint_number).padStart(4, '0')}`;\n" +
                "    if (c.history && c.history.length > 0) {\n" +
                "      body.innerHTML = c.history.map(h => `\n" +
                "        <div class=\"audit-node\">\n" +
                "          <strong>${escapeHtml(h.new_status)}</strong>: ${escapeHtml(h.note || 'No note')}\n" +
                "          <div style=\"font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;\">🕒 ${formatDate(h.updated_at)}</div>\n" +
                "        </div>\n" +
                "      `).join('');\n" +
                "    } else {\n" +
                "      body.innerHTML = 'No history records found.';\n" +
                "    }\n" +
                "  } catch (e) { body.innerHTML = 'Error loading history.'; }\n" +
                "}\n" +
                "\n" +
                "// AI Auto-Classify & Duplicates in Complaint Form\n" +
                "async function triggerAiClassify() {\n" +
                "  const desc = document.getElementById('newDescription').value;\n" +
                "  const loc = document.getElementById('newLocation').value;\n" +
                "  if (!desc || desc.trim().length < 5) {\n" +
                "    alert('Please enter a description first so AI can analyze it.');\n" +
                "    return;\n" +
                "  }\n" +
                "  const res = await fetch('/api/complaints/ai-classify', {\n" +
                "    method: 'POST',\n" +
                "    headers: { 'Content-Type': 'application/json' },\n" +
                "    body: JSON.stringify({ description: desc, location: loc })\n" +
                "  });\n" +
                "  const json = await res.json();\n" +
                "  if (json.data) {\n" +
                "    document.getElementById('newCategory').value = json.data.category;\n" +
                "    document.getElementById('newPriority').value = json.data.priority;\n" +
                "    const b = document.getElementById('aiResultBanner');\n" +
                "    b.innerHTML = `✨ <strong>AI Auto-Triage:</strong> Classified as <strong>${json.data.category}</strong> (${json.data.priority} Priority). Recommended team: ${json.data.assignedTeam}`;\n" +
                "    b.style.display = 'block';\n" +
                "    checkDuplicateLocation();\n" +
                "  }\n" +
                "}\n" +
                "\n" +
                "async function checkDuplicateLocation() {\n" +
                "  const loc = document.getElementById('newLocation').value.trim();\n" +
                "  const cat = document.getElementById('newCategory').value;\n" +
                "  const banner = document.getElementById('duplicateAlert');\n" +
                "  if (loc.length < 3) { banner.style.display = 'none'; return; }\n" +
                "  const res = await fetch(`/api/complaints/check-duplicate?location=${encodeURIComponent(loc)}&category=${encodeURIComponent(cat)}`);\n" +
                "  const json = await res.json();\n" +
                "  if (json.data && json.data.length > 0) {\n" +
                "    const m = json.data[0];\n" +
                "    banner.innerHTML = `⚠️ <strong>Duplicate Alert:</strong> Ticket #SCMS-${String(m.complaint_number).padStart(4, '0')} (${m.status}) is already logged for this location.`;\n" +
                "    banner.style.display = 'flex';\n" +
                "  } else {\n" +
                "    banner.style.display = 'none';\n" +
                "  }\n" +
                "}\n" +
                "\n" +
                "async function handleComplaintSubmit(e) {\n" +
                "  e.preventDefault();\n" +
                "  const category = document.getElementById('newCategory').value;\n" +
                "  const location = document.getElementById('newLocation').value;\n" +
                "  const description = document.getElementById('newDescription').value;\n" +
                "  const priority = document.getElementById('newPriority').value;\n" +
                "  const image_url = document.getElementById('newImageUrl').value;\n" +
                "  const res = await fetch('/api/complaints', {\n" +
                "    method: 'POST',\n" +
                "    headers: { 'Content-Type': 'application/json' },\n" +
                "    body: JSON.stringify({ category, location, description, priority, image_url })\n" +
                "  });\n" +
                "  if (res.ok) {\n" +
                "    window.location.href = '/dashboard';\n" +
                "  } else {\n" +
                "    const err = await res.json();\n" +
                "    alert(err.error || 'Failed to file complaint');\n" +
                "  }\n" +
                "}\n" +
                "\n" +
                "function updatePhotoPreview() {\n" +
                "  const url = document.getElementById('newImageUrl').value;\n" +
                "  const box = document.getElementById('photoPreviewBox');\n" +
                "  const img = document.getElementById('formPhotoPreview');\n" +
                "  if (url && url.length > 5) {\n" +
                "    img.src = url;\n" +
                "    box.style.display = 'block';\n" +
                "  } else { box.style.display = 'none'; }\n" +
                "}\n" +
                "\n" +
                "// Notifications\n" +
                "async function loadNotifications() {\n" +
                "  try {\n" +
                "    const res = await fetch('/api/notifications');\n" +
                "    const json = await res.json();\n" +
                "    const list = json.data || [];\n" +
                "    const unread = list.filter(n => !n.read).length;\n" +
                "    const badge = document.getElementById('notifBadge');\n" +
                "    if (badge) {\n" +
                "      if (unread > 0) {\n" +
                "        badge.textContent = unread;\n" +
                "        badge.style.display = 'flex';\n" +
                "      } else { badge.style.display = 'none'; }\n" +
                "    }\n" +
                "    const body = document.getElementById('notifBody');\n" +
                "    if (body) {\n" +
                "      if (list.length === 0) {\n" +
                "        body.innerHTML = '<div style=\"padding:1rem; text-align:center; color:var(--text-muted);\">No notifications</div>';\n" +
                "      } else {\n" +
                "        body.innerHTML = list.map(n => `\n" +
                "          <div class=\"notif-item ${!n.read ? 'unread' : ''}\">\n" +
                "            <div style=\"font-weight:700;\">${escapeHtml(n.title)}</div>\n" +
                "            <div style=\"color:var(--text-muted); margin-top:0.2rem;\">${escapeHtml(n.message)}</div>\n" +
                "            <div style=\"font-size:0.7rem; color:var(--text-muted); margin-top:0.3rem;\">🕒 ${formatDate(n.created_at)}</div>\n" +
                "          </div>\n" +
                "        `).join('');\n" +
                "      }\n" +
                "    }\n" +
                "  } catch(e) {}\n" +
                "}\n" +
                "\n" +
                "function toggleNotifications() {\n" +
                "  const el = document.getElementById('notifDropdown');\n" +
                "  if (el) el.classList.toggle('open');\n" +
                "}\n" +
                "\n" +
                "async function markNotificationsRead() {\n" +
                "  await fetch('/api/notifications', { method: 'PATCH' });\n" +
                "  loadNotifications();\n" +
                "}\n" +
                "\n" +
                "function exportCsv() { window.open('/api/export/csv', '_blank'); }\n" +
                "function debounceSearch() { clearTimeout(searchDebounce); searchDebounce = setTimeout(loadStudentComplaints, 300); }\n" +
                "function debounceAdminSearch() { clearTimeout(searchDebounce); searchDebounce = setTimeout(loadAdminComplaints, 300); }\n" +
                "function resetFilters() {\n" +
                "  document.getElementById('searchInput').value = '';\n" +
                "  document.getElementById('statusFilter').value = 'all';\n" +
                "  document.getElementById('categoryFilter').value = 'all';\n" +
                "  document.getElementById('priorityFilter').value = 'all';\n" +
                "  loadStudentComplaints();\n" +
                "}\n" +
                "function resetAdminFilters() {\n" +
                "  document.getElementById('adminSearchInput').value = '';\n" +
                "  document.getElementById('adminStatusFilter').value = 'all';\n" +
                "  document.getElementById('adminCategoryFilter').value = 'all';\n" +
                "  loadAdminComplaints();\n" +
                "}\n" +
                "\n" +
                "function escapeHtml(s) { if (!s) return ''; return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;'); }\n" +
                "function formatDate(iso) { if (!iso) return ''; try { const d = new Date(iso); return d.toLocaleDateString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); } catch(e){ return iso; } }\n" +
                "\n" +
                "// Auto-init based on page\n" +
                "loadKpiMetrics();\n" +
                "loadStudentComplaints();\n" +
                "loadAdminComplaints();\n" +
                "loadNotifications();\n";
    }
}
