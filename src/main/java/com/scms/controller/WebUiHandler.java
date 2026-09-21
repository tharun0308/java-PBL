package com.scms.controller;

import com.scms.model.User;
import com.scms.service.AuthService;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * Controller serving the complete, interactive Single Page Web Application directly from Java.
 * Features 5 KPI metric cards, live 4-stage visual tracker, photo zoom modal, AI auto-classifier,
 * duplicate warning banner, dark mode toggle, SLA timers, notifications bell, and CSV export.
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
        String role = userOpt.map(User::getRole).orElse("user");
        String fullName = userOpt.map(User::getFull_name).orElse("Alex Johnson");
        String email = userOpt.map(User::getEmail).orElse("student@college.edu");

        String html = getHtmlContent(role, fullName, email);
        byte[] bytes = html.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
        exchange.sendResponseHeaders(200, bytes.length);

        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private String getHtmlContent(String initialRole, String initialName, String initialEmail) {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\" class=\"light\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\" />\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n" +
                "  <title>SCMS - Smart Complaint Management System</title>\n" +
                "  <style>\n" +
                "    :root {\n" +
                "      --bg-primary: #f8fafc;\n" +
                "      --bg-surface: #ffffff;\n" +
                "      --bg-surface-hover: #f1f5f9;\n" +
                "      --border-color: #e2e8f0;\n" +
                "      --text-main: #0f172a;\n" +
                "      --text-muted: #64748b;\n" +
                "      --primary: #2563eb;\n" +
                "      --primary-hover: #1d4ed8;\n" +
                "      --primary-light: #eff6ff;\n" +
                "      --accent: #6366f1;\n" +
                "      --success: #10b981;\n" +
                "      --warning: #f59e0b;\n" +
                "      --danger: #ef4444;\n" +
                "      --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);\n" +
                "      --radius: 12px;\n" +
                "    }\n" +
                "    html.dark {\n" +
                "      --bg-primary: #0b0f19;\n" +
                "      --bg-surface: #131b2e;\n" +
                "      --bg-surface-hover: #1e293b;\n" +
                "      --border-color: #27354f;\n" +
                "      --text-main: #f1f5f9;\n" +
                "      --text-muted: #94a3b8;\n" +
                "      --primary: #3b82f6;\n" +
                "      --primary-hover: #2563eb;\n" +
                "      --primary-light: #1e293b;\n" +
                "      --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);\n" +
                "    }\n" +
                "    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }\n" +
                "    body { background-color: var(--bg-primary); color: var(--text-main); min-height: 100vh; display: flex; flex-direction: column; transition: background-color 0.2s, color 0.2s; }\n" +
                "    header { background: var(--bg-surface); border-bottom: 1px solid var(--border-color); padding: 0.75rem 1.5rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }\n" +
                "    .logo-badge { display: flex; align-items: center; gap: 0.75rem; font-weight: 700; font-size: 1.15rem; color: var(--text-main); text-decoration: none; }\n" +
                "    .logo-icon { background: linear-gradient(135deg, #2563eb, #6366f1); color: white; width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.1rem; }\n" +
                "    .nav-actions { display: flex; align-items: center; gap: 0.75rem; }\n" +
                "    button, .btn { cursor: pointer; border: 1px solid transparent; border-radius: 8px; padding: 0.5rem 0.9rem; font-size: 0.875rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; transition: all 0.15s ease-in-out; text-decoration: none; }\n" +
                "    .btn-primary { background: var(--primary); color: white; }\n" +
                "    .btn-primary:hover { background: var(--primary-hover); }\n" +
                "    .btn-outline { background: transparent; border-color: var(--border-color); color: var(--text-main); }\n" +
                "    .btn-outline:hover { background: var(--bg-surface-hover); }\n" +
                "    .btn-danger { background: var(--danger); color: white; }\n" +
                "    .btn-sm { padding: 0.35rem 0.65rem; font-size: 0.8rem; }\n" +
                "    .container { max-width: 1280px; width: 100%; margin: 0 auto; padding: 1.5rem; flex: 1; }\n" +
                "    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }\n" +
                "    .kpi-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1.25rem; box-shadow: var(--card-shadow); display: flex; flex-direction: column; }\n" +
                "    .kpi-title { font-size: 0.825rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }\n" +
                "    .kpi-val { font-size: 2rem; font-weight: 800; margin-top: 0.5rem; color: var(--text-main); }\n" +
                "    .kpi-sub { font-size: 0.775rem; color: var(--text-muted); margin-top: 0.25rem; }\n" +
                "    .controls-bar { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1rem; margin-bottom: 1.5rem; display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between; box-shadow: var(--card-shadow); }\n" +
                "    .filters-group { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }\n" +
                "    input[type='text'], select, textarea { background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.875rem; outline: none; transition: border-color 0.15s; }\n" +
                "    input[type='text']:focus, select:focus, textarea:focus { border-color: var(--primary); }\n" +
                "    .complaints-list { display: flex; flex-direction: column; gap: 1rem; }\n" +
                "    .tracker-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--card-shadow); display: flex; flex-direction: column; gap: 1.25rem; }\n" +
                "    .card-top { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 0.75rem; }\n" +
                "    .card-meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; font-size: 0.8rem; color: var(--text-muted); }\n" +
                "    .badge { padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; border: 1px solid transparent; }\n" +
                "    .badge-pending { background: #fef3c7; color: #92400e; border-color: #fde68a; }\n" +
                "    .badge-in-progress { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }\n" +
                "    .badge-resolved { background: #d1fae5; color: #065f46; border-color: #a7f3d0; }\n" +
                "    .badge-rejected { background: #fee2e2; color: #991b1b; border-color: #fecaca; }\n" +
                "    .badge-high { background: #fee2e2; color: #b91c1c; }\n" +
                "    .badge-medium { background: #fef3c7; color: #b45309; }\n" +
                "    .badge-low { background: #f1f5f9; color: #475569; }\n" +
                "    .tracker-steps { display: grid; grid-template-columns: repeat(4, 1fr); position: relative; margin: 0.5rem 0; }\n" +
                "    .step-item { display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; z-index: 2; }\n" +
                "    .step-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; background: var(--bg-surface-hover); color: var(--text-muted); border: 2px solid var(--border-color); margin-bottom: 0.35rem; transition: all 0.2s; }\n" +
                "    .step-circle.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2); }\n" +
                "    .step-circle.completed { background: #10b981; color: white; border-color: #10b981; }\n" +
                "    .step-title { font-size: 0.775rem; font-weight: 600; color: var(--text-muted); }\n" +
                "    .step-title.active { color: var(--text-main); font-weight: 700; }\n" +
                "    .tracker-bar { position: absolute; top: 16px; left: 12%; right: 12%; height: 3px; background: var(--border-color); z-index: 1; }\n" +
                "    .tracker-bar-fill { height: 100%; background: #10b981; transition: width 0.3s ease; }\n" +
                "    .card-body { display: grid; grid-template-columns: 1fr auto; gap: 1.5rem; align-items: center; }\n" +
                "    @media (max-width: 640px) { .card-body { grid-template-columns: 1fr; } }\n" +
                "    .thumb-img { width: 90px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); cursor: pointer; transition: transform 0.15s; }\n" +
                "    .thumb-img:hover { transform: scale(1.05); }\n" +
                "    .rating-box { background: var(--bg-primary); border: 1px dashed var(--border-color); border-radius: 8px; padding: 0.75rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }\n" +
                "    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); opacity: 0; pointer-events: none; transition: opacity 0.2s; }\n" +
                "    .modal-overlay.open { opacity: 1; pointer-events: auto; }\n" +
                "    .modal-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 16px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); }\n" +
                "    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); }\n" +
                "    .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }\n" +
                "    .form-label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }\n" +
                "    .alert-banner { padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }\n" +
                "    .alert-warning { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }\n" +
                "    .alert-info { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }\n" +
                "    .star { cursor: pointer; font-size: 1.25rem; color: #cbd5e1; transition: color 0.15s; }\n" +
                "    .star.filled { color: #f59e0b; }\n" +
                "    .audit-list { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }\n" +
                "    .audit-item { padding-left: 1rem; border-left: 2px solid var(--primary); font-size: 0.825rem; }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <header>\n" +
                "    <a href=\"#\" class=\"logo-badge\">\n" +
                "      <div class=\"logo-icon\">⚡</div>\n" +
                "      <div>\n" +
                "        <span>SCMS</span>\n" +
                "        <span style=\"font-size: 0.75rem; color: var(--text-muted); font-weight: 400; margin-left: 0.4rem;\">Java Engine</span>\n" +
                "      </div>\n" +
                "    </a>\n" +
                "    <div class=\"nav-actions\">\n" +
                "      <button class=\"btn btn-outline btn-sm\" id=\"themeToggle\" onclick=\"toggleTheme()\">🌙 Dark</button>\n" +
                "      <button class=\"btn btn-outline btn-sm\" id=\"roleToggle\" onclick=\"toggleRole()\">Switch to Admin</button>\n" +
                "      <div style=\"font-size: 0.825rem; font-weight: 600; color: var(--text-muted);\" id=\"userDisplay\">Alex Johnson (Student)</div>\n" +
                "    </div>\n" +
                "  </header>\n" +
                "\n" +
                "  <div class=\"container\">\n" +
                "    <!-- Admin Forbidden Alert (when in Admin mode) -->\n" +
                "    <div id=\"adminRoleNotice\" class=\"alert-banner alert-info\" style=\"display:none;\">\n" +
                "      🛡️ <strong>Admin Mode Active:</strong> You are viewing campus-wide complaints and triage controls. Notice: Campus administrators cannot file complaints.\n" +
                "    </div>\n" +
                "\n" +
                "    <!-- 5 KPI Cards -->\n" +
                "    <div class=\"kpi-grid\">\n" +
                "      <div class=\"kpi-card\">\n" +
                "        <span class=\"kpi-title\">Total Complaints</span>\n" +
                "        <span class=\"kpi-val\" id=\"kpiTotal\">--</span>\n" +
                "        <span class=\"kpi-sub\">Active & archived records</span>\n" +
                "      </div>\n" +
                "      <div class=\"kpi-card\">\n" +
                "        <span class=\"kpi-title\">Pending Review</span>\n" +
                "        <span class=\"kpi-val\" id=\"kpiPending\" style=\"color: var(--warning);\">--</span>\n" +
                "        <span class=\"kpi-sub\">Awaiting facility triage</span>\n" +
                "      </div>\n" +
                "      <div class=\"kpi-card\">\n" +
                "        <span class=\"kpi-title\">In Progress</span>\n" +
                "        <span class=\"kpi-val\" id=\"kpiInProgress\" style=\"color: var(--primary);\">--</span>\n" +
                "        <span class=\"kpi-sub\">Assigned to field staff</span>\n" +
                "      </div>\n" +
                "      <div class=\"kpi-card\">\n" +
                "        <span class=\"kpi-title\">Resolved</span>\n" +
                "        <span class=\"kpi-val\" id=\"kpiResolved\" style=\"color: var(--success);\">--</span>\n" +
                "        <span class=\"kpi-sub\">Successfully closed</span>\n" +
                "      </div>\n" +
                "      <div class=\"kpi-card\">\n" +
                "        <span class=\"kpi-title\">Overdue / Urgent</span>\n" +
                "        <span class=\"kpi-val\" id=\"kpiOverdue\" style=\"color: var(--danger);\">--</span>\n" +
                "        <span class=\"kpi-sub\">SLA breached</span>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "\n" +
                "    <!-- Control Toolbar -->\n" +
                "    <div class=\"controls-bar\">\n" +
                "      <div class=\"filters-group\">\n" +
                "        <input type=\"text\" id=\"searchInput\" placeholder=\"🔍 Search location or text...\" oninput=\"debounceSearch()\" style=\"width: 220px;\" />\n" +
                "        <select id=\"statusSelect\" onchange=\"loadComplaints()\">\n" +
                "          <option value=\"all\">All Statuses</option>\n" +
                "          <option value=\"Pending\">Pending</option>\n" +
                "          <option value=\"In Progress\">In Progress</option>\n" +
                "          <option value=\"Resolved\">Resolved</option>\n" +
                "          <option value=\"Rejected\">Rejected</option>\n" +
                "        </select>\n" +
                "        <select id=\"categorySelect\" onchange=\"loadComplaints()\">\n" +
                "          <option value=\"all\">All Categories</option>\n" +
                "          <option value=\"Electrical\">Electrical</option>\n" +
                "          <option value=\"Water Supply\">Water Supply</option>\n" +
                "          <option value=\"Cleanliness\">Cleanliness</option>\n" +
                "          <option value=\"Internet/IT\">Internet/IT</option>\n" +
                "          <option value=\"Hostel Maintenance\">Hostel Maintenance</option>\n" +
                "          <option value=\"Laboratory Equipment\">Laboratory Equipment</option>\n" +
                "          <option value=\"Infrastructure\">Infrastructure</option>\n" +
                "          <option value=\"Other\">Other</option>\n" +
                "        </select>\n" +
                "        <select id=\"prioritySelect\" onchange=\"loadComplaints()\">\n" +
                "          <option value=\"all\">All Priorities</option>\n" +
                "          <option value=\"High\">High</option>\n" +
                "          <option value=\"Medium\">Medium</option>\n" +
                "          <option value=\"Low\">Low</option>\n" +
                "        </select>\n" +
                "        <button class=\"btn btn-outline btn-sm\" onclick=\"resetFilters()\">Reset</button>\n" +
                "      </div>\n" +
                "      <div style=\"display: flex; gap: 0.5rem;\">\n" +
                "        <button class=\"btn btn-outline\" onclick=\"exportCsv()\">📥 Export CSV</button>\n" +
                "        <button class=\"btn btn-primary\" id=\"fileBtn\" onclick=\"openNewModal()\">➕ File Complaint</button>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "\n" +
                "    <!-- Complaint List -->\n" +
                "    <div id=\"complaintsList\" class=\"complaints-list\">\n" +
                "      <div style=\"text-align: center; padding: 3rem; color: var(--text-muted);\">Loading complaints from Java backend...</div>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "\n" +
                "  <!-- New Complaint Modal -->\n" +
                "  <div class=\"modal-overlay\" id=\"newModal\">\n" +
                "    <div class=\"modal-card\">\n" +
                "      <div class=\"modal-header\">\n" +
                "        <h3>Submit Campus Complaint</h3>\n" +
                "        <button class=\"btn btn-outline btn-sm\" onclick=\"closeModal('newModal')\">✕</button>\n" +
                "      </div>\n" +
                "      <div id=\"duplicateAlert\" class=\"alert-banner alert-warning\" style=\"display:none;\">\n" +
                "        ⚠️ <strong>Duplicate Alert:</strong> A similar complaint is already active at this location.\n" +
                "      </div>\n" +
                "      <div class=\"form-group\">\n" +
                "        <label class=\"form-label\">Category</label>\n" +
                "        <select id=\"newCategory\">\n" +
                "          <option value=\"Electrical\">Electrical</option>\n" +
                "          <option value=\"Water Supply\">Water Supply</option>\n" +
                "          <option value=\"Cleanliness\">Cleanliness</option>\n" +
                "          <option value=\"Internet/IT\">Internet/IT</option>\n" +
                "          <option value=\"Hostel Maintenance\">Hostel Maintenance</option>\n" +
                "          <option value=\"Laboratory Equipment\">Laboratory Equipment</option>\n" +
                "          <option value=\"Infrastructure\">Infrastructure</option>\n" +
                "          <option value=\"Other\">Other</option>\n" +
                "        </select>\n" +
                "      </div>\n" +
                "      <div class=\"form-group\">\n" +
                "        <label class=\"form-label\">Location (e.g. Block B, Room 304)</label>\n" +
                "        <input type=\"text\" id=\"newLocation\" placeholder=\"Specific room or facility location\" onblur=\"checkDuplicate()\" />\n" +
                "      </div>\n" +
                "      <div class=\"form-group\">\n" +
                "        <div style=\"display:flex; justify-content: space-between; align-items:center;\">\n" +
                "          <label class=\"form-label\">Description</label>\n" +
                "          <button type=\"button\" class=\"btn btn-outline btn-sm\" style=\"font-size:0.75rem; padding:0.2rem 0.5rem;\" onclick=\"triggerAiAutoClassify()\">✨ AI Auto-Classify</button>\n" +
                "        </div>\n" +
                "        <textarea id=\"newDescription\" rows=\"3\" placeholder=\"Describe the problem in detail...\"></textarea>\n" +
                "      </div>\n" +
                "      <div id=\"aiFeedbackBox\" style=\"font-size: 0.8rem; color: var(--primary); margin-bottom: 0.75rem; display:none;\"></div>\n" +
                "      <div class=\"form-group\">\n" +
                "        <label class=\"form-label\">Priority Level</label>\n" +
                "        <select id=\"newPriority\">\n" +
                "          <option value=\"Medium\">Medium (48h Turnaround)</option>\n" +
                "          <option value=\"High\">High (24h Urgent)</option>\n" +
                "          <option value=\"Low\">Low (120h Routine)</option>\n" +
                "        </select>\n" +
                "      </div>\n" +
                "      <div class=\"form-group\">\n" +
                "        <label class=\"form-label\">Photo Evidence URL (Optional)</label>\n" +
                "        <input type=\"text\" id=\"newImageUrl\" placeholder=\"https://images.unsplash.com/... or data URL\" />\n" +
                "      </div>\n" +
                "      <div style=\"display:flex; justify-content: flex-end; gap:0.5rem; margin-top:1rem;\">\n" +
                "        <button class=\"btn btn-outline\" onclick=\"closeModal('newModal')\">Cancel</button>\n" +
                "        <button class=\"btn btn-primary\" onclick=\"submitComplaint()\">Submit Complaint</button>\n" +
                "      </div>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "\n" +
                "  <!-- Image Zoom Modal -->\n" +
                "  <div class=\"modal-overlay\" id=\"imageModal\" onclick=\"closeModal('imageModal')\">\n" +
                "    <div style=\"max-width: 900px; max-height: 85vh; text-align: center;\">\n" +
                "      <img id=\"zoomImage\" src=\"\" style=\"max-width: 100%; max-height: 80vh; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);\" />\n" +
                "    </div>\n" +
                "  </div>\n" +
                "\n" +
                "  <!-- Action / Detail Modal -->\n" +
                "  <div class=\"modal-overlay\" id=\"detailModal\">\n" +
                "    <div class=\"modal-card\">\n" +
                "      <div class=\"modal-header\">\n" +
                "        <h3 id=\"detailTitle\">Complaint Details</h3>\n" +
                "        <button class=\"btn btn-outline btn-sm\" onclick=\"closeModal('detailModal')\">✕</button>\n" +
                "      </div>\n" +
                "      <div id=\"detailContent\"></div>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "\n" +
                "  <script>\n" +
                "    let currentRole = '" + initialRole + "';\n" +
                "    let searchTimeout = null;\n" +
                "\n" +
                "    function toggleTheme() {\n" +
                "      const html = document.documentElement;\n" +
                "      if (html.classList.contains('dark')) {\n" +
                "        html.classList.remove('dark');\n" +
                "        document.getElementById('themeToggle').textContent = '🌙 Dark';\n" +
                "      } else {\n" +
                "        html.classList.add('dark');\n" +
                "        document.getElementById('themeToggle').textContent = '☀️ Light';\n" +
                "      }\n" +
                "    }\n" +
                "\n" +
                "    function toggleRole() {\n" +
                "      currentRole = currentRole === 'admin' ? 'user' : 'admin';\n" +
                "      updateRoleDisplay();\n" +
                "      loadSummary();\n" +
                "      loadComplaints();\n" +
                "    }\n" +
                "\n" +
                "    function updateRoleDisplay() {\n" +
                "      const roleBtn = document.getElementById('roleToggle');\n" +
                "      const userDisp = document.getElementById('userDisplay');\n" +
                "      const notice = document.getElementById('adminRoleNotice');\n" +
                "      const fileBtn = document.getElementById('fileBtn');\n" +
                "\n" +
                "      if (currentRole === 'admin') {\n" +
                "        roleBtn.textContent = 'Switch to Student';\n" +
                "        userDisp.textContent = 'Campus Administrator';\n" +
                "        notice.style.display = 'flex';\n" +
                "        fileBtn.disabled = true;\n" +
                "        fileBtn.title = 'Admins cannot file complaints';\n" +
                "        fileBtn.style.opacity = '0.5';\n" +
                "      } else {\n" +
                "        roleBtn.textContent = 'Switch to Admin';\n" +
                "        userDisp.textContent = 'Alex Johnson (Student)';\n" +
                "        notice.style.display = 'none';\n" +
                "        fileBtn.disabled = false;\n" +
                "        fileBtn.title = '';\n" +
                "        fileBtn.style.opacity = '1';\n" +
                "      }\n" +
                "    }\n" +
                "\n" +
                "    async function loadSummary() {\n" +
                "      try {\n" +
                "        const res = await fetch('/api/reports/summary');\n" +
                "        const json = await res.json();\n" +
                "        if (json.data) {\n" +
                "          document.getElementById('kpiTotal').textContent = json.data.total;\n" +
                "          document.getElementById('kpiPending').textContent = json.data.pending;\n" +
                "          document.getElementById('kpiInProgress').textContent = json.data.inProgress;\n" +
                "          document.getElementById('kpiResolved').textContent = json.data.resolved;\n" +
                "          document.getElementById('kpiOverdue').textContent = json.data.overdue;\n" +
                "        }\n" +
                "      } catch (e) { console.error(e); }\n" +
                "    }\n" +
                "\n" +
                "    async function loadComplaints() {\n" +
                "      const status = document.getElementById('statusSelect').value;\n" +
                "      const category = document.getElementById('categorySelect').value;\n" +
                "      const priority = document.getElementById('prioritySelect').value;\n" +
                "      const search = document.getElementById('searchInput').value;\n" +
                "\n" +
                "      let url = '/api/complaints?';\n" +
                "      if (status !== 'all') url += 'status=' + encodeURIComponent(status) + '&';\n" +
                "      if (category !== 'all') url += 'category=' + encodeURIComponent(category) + '&';\n" +
                "      if (priority !== 'all') url += 'priority=' + encodeURIComponent(priority) + '&';\n" +
                "      if (search) url += 'search=' + encodeURIComponent(search);\n" +
                "\n" +
                "      try {\n" +
                "        const res = await fetch(url);\n" +
                "        const json = await res.json();\n" +
                "        renderComplaints(json.data || []);\n" +
                "      } catch (e) {\n" +
                "        document.getElementById('complaintsList').innerHTML = '<div style=\"text-align:center; padding: 2rem; color: var(--danger);\">Failed to load complaints.</div>';\n" +
                "      }\n" +
                "    }\n" +
                "\n" +
                "    function renderComplaints(items) {\n" +
                "      const container = document.getElementById('complaintsList');\n" +
                "      if (!items || items.length === 0) {\n" +
                "        container.innerHTML = '<div style=\"text-align:center; padding: 3rem; color: var(--text-muted);\">No complaints found matching criteria.</div>';\n" +
                "        return;\n" +
                "      }\n" +
                "\n" +
                "      container.innerHTML = items.map(c => {\n" +
                "        const num = String(c.complaint_number).padStart(4, '0');\n" +
                "        const stepIdx = getStepIndex(c.status);\n" +
                "        const sla = c.sla || {};\n" +
                "        return `\n" +
                "          <div class=\"tracker-card\">\n" +
                "            <div class=\"card-top\">\n" +
                "              <div>\n" +
                "                <div style=\"display:flex; align-items:center; gap:0.5rem;\">\n" +
                "                  <span style=\"font-weight:800; font-size:1.1rem;\">#SCMS-${num}</span>\n" +
                "                  <span class=\"badge badge-${c.status.toLowerCase().replace(' ', '-')}\">${c.status}</span>\n" +
                "                  <span class=\"badge badge-${c.priority.toLowerCase()}\">${c.priority} Priority</span>\n" +
                "                  <span class=\"badge\" style=\"background: var(--bg-surface-hover); border-color: var(--border-color); color: var(--text-muted);\">${sla.badgeText || ''}</span>\n" +
                "                </div>\n" +
                "                <div class=\"card-meta\" style=\"margin-top:0.35rem;\">\n" +
                "                  <span>📍 <strong>${escapeHtml(c.location)}</strong></span>\n" +
                "                  <span>•</span>\n" +
                "                  <span>📁 ${escapeHtml(c.category)}</span>\n" +
                "                  <span>•</span>\n" +
                "                  <span>🕒 ${formatDate(c.created_at)}</span>\n" +
                "                </div>\n" +
                "              </div>\n" +
                "              <div style=\"display:flex; gap:0.5rem;\">\n" +
                "                <button class=\"btn btn-outline btn-sm\" onclick=\"openDetailModal('${c.id}')\">View Audit Trail</button>\n" +
                "                ${currentRole === 'admin' ? `<button class=\"btn btn-primary btn-sm\" onclick=\"openTriageModal('${c.id}', '${c.status}')\">⚙️ Update Status</button>` : ''}\n" +
                "              </div>\n" +
                "            </div>\n" +
                "\n" +
                "            <!-- 4-Stage Progress Tracker -->\n" +
                "            <div class=\"tracker-steps\">\n" +
                "              <div class=\"tracker-bar\"><div class=\"tracker-bar-fill\" style=\"width: ${stepIdx * 33.33}%\"></div></div>\n" +
                "              <div class=\"step-item\">\n" +
                "                <div class=\"step-circle ${stepIdx >= 0 ? 'completed' : ''}\">✓</div>\n" +
                "                <span class=\"step-title ${stepIdx === 0 ? 'active' : ''}\">Submitted</span>\n" +
                "              </div>\n" +
                "              <div class=\"step-item\">\n" +
                "                <div class=\"step-circle ${stepIdx >= 1 ? (stepIdx > 1 ? 'completed' : 'active') : ''}\">${stepIdx > 1 ? '✓' : '2'}</div>\n" +
                "                <span class=\"step-title ${stepIdx === 1 ? 'active' : ''}\">Assigned</span>\n" +
                "              </div>\n" +
                "              <div class=\"step-item\">\n" +
                "                <div class=\"step-circle ${stepIdx >= 2 ? (stepIdx > 2 ? 'completed' : 'active') : ''}\">${stepIdx > 2 ? '✓' : '3'}</div>\n" +
                "                <span class=\"step-title ${stepIdx === 2 ? 'active' : ''}\">In Progress</span>\n" +
                "              </div>\n" +
                "              <div class=\"step-item\">\n" +
                "                <div class=\"step-circle ${stepIdx === 3 ? 'completed' : ''}\">${stepIdx === 3 ? '✓' : '4'}</div>\n" +
                "                <span class=\"step-title ${stepIdx === 3 ? 'active' : ''}\">Resolved</span>\n" +
                "              </div>\n" +
                "            </div>\n" +
                "\n" +
                "            <div class=\"card-body\">\n" +
                "              <div>\n" +
                "                <p style=\"font-size: 0.95rem; line-height: 1.5; color: var(--text-main);\">${escapeHtml(c.description)}</p>\n" +
                "                ${c.assigned_to ? `<div style=\"margin-top:0.5rem; font-size:0.825rem; color:var(--text-muted);\">👷 Assigned Unit: <strong>${escapeHtml(c.assigned_to)}</strong></div>` : ''}\n" +
                "                ${c.resolution_note ? `<div style=\"margin-top:0.35rem; font-size:0.825rem; color:#059669;\">✅ Resolution: ${escapeHtml(c.resolution_note)}</div>` : ''}\n" +
                "              </div>\n" +
                "              ${c.image_url ? `<img src=\"${escapeHtml(c.image_url)}\" class=\"thumb-img\" onclick=\"zoomImage('${escapeHtml(c.image_url)}')\" title=\"Click to zoom evidence\" alt=\"Evidence\" />` : ''}\n" +
                "            </div>\n" +
                "\n" +
                "            <!-- Rating Section if Resolved -->\n" +
                "            ${c.status === 'Resolved' ? `\n" +
                "              <div class=\"rating-box\">\n" +
                "                <div>\n" +
                "                  <strong>Student Satisfaction:</strong>\n" +
                "                  <span style=\"margin-left:0.5rem;\">${renderStars(c.id, c.rating)}</span>\n" +
                "                  ${c.feedback_note ? `<span style=\"margin-left:0.5rem; font-style:italic; font-size:0.85rem; color:var(--text-muted);\">\"${escapeHtml(c.feedback_note)}\"</span>` : ''}\n" +
                "                </div>\n" +
                "                ${!c.rating && currentRole === 'user' ? `<button class=\"btn btn-outline btn-sm\" onclick=\"submitQuickRating('${c.id}')\">Submit Feedback</button>` : ''}\n" +
                "              </div>\n" +
                "            ` : ''}\n" +
                "          </div>\n" +
                "        `;\n" +
                "      }).join('');\n" +
                "    }\n" +
                "\n" +
                "    function getStepIndex(status) {\n" +
                "      if (status === 'Resolved') return 3;\n" +
                "      if (status === 'In Progress') return 2;\n" +
                "      if (status === 'Pending') return 1;\n" +
                "      return 0;\n" +
                "    }\n" +
                "\n" +
                "    function renderStars(id, rating) {\n" +
                "      const r = rating || 0;\n" +
                "      let html = '';\n" +
                "      for (let i = 1; i <= 5; i++) {\n" +
                "        html += `<span class=\"star ${i <= r ? 'filled' : ''}\" onclick=\"rateComplaint('${id}', ${i})\">★</span>`;\n" +
                "      }\n" +
                "      return html;\n" +
                "    }\n" +
                "\n" +
                "    async function rateComplaint(id, stars) {\n" +
                "      if (currentRole === 'admin') {\n" +
                "        alert('Administrators cannot rate complaints.');\n" +
                "        return;\n" +
                "      }\n" +
                "      const note = prompt('Add an optional feedback note:');\n" +
                "      if (note === null) return;\n" +
                "      try {\n" +
                "        const res = await fetch(`/api/complaints/${id}/feedback`, {\n" +
                "          method: 'POST',\n" +
                "          headers: { 'Content-Type': 'application/json' },\n" +
                "          body: JSON.stringify({ rating: stars, feedback_note: note })\n" +
                "        });\n" +
                "        if (res.ok) {\n" +
                "          loadComplaints();\n" +
                "          loadSummary();\n" +
                "        } else {\n" +
                "          const err = await res.json();\n" +
                "          alert(err.error || 'Failed to submit rating');\n" +
                "        }\n" +
                "      } catch (e) { alert(e.message); }\n" +
                "    }\n" +
                "\n" +
                "    async function checkDuplicate() {\n" +
                "      const loc = document.getElementById('newLocation').value.trim();\n" +
                "      const cat = document.getElementById('newCategory').value;\n" +
                "      const alertBox = document.getElementById('duplicateAlert');\n" +
                "      if (loc.length < 3) {\n" +
                "        alertBox.style.display = 'none';\n" +
                "        return;\n" +
                "      }\n" +
                "      try {\n" +
                "        const res = await fetch(`/api/complaints/check-duplicate?location=${encodeURIComponent(loc)}&category=${encodeURIComponent(cat)}`);\n" +
                "        const json = await res.json();\n" +
                "        if (json.data && json.data.length > 0) {\n" +
                "          const match = json.data[0];\n" +
                "          alertBox.innerHTML = `⚠️ <strong>Duplicate Alert:</strong> Complaint #SCMS-${String(match.complaint_number).padStart(4, '0')} (${match.status}) is already logged at this location.`;\n" +
                "          alertBox.style.display = 'flex';\n" +
                "        } else {\n" +
                "          alertBox.style.display = 'none';\n" +
                "        }\n" +
                "      } catch (e) {}\n" +
                "    }\n" +
                "\n" +
                "    async function triggerAiAutoClassify() {\n" +
                "      const desc = document.getElementById('newDescription').value;\n" +
                "      const loc = document.getElementById('newLocation').value;\n" +
                "      if (!desc || desc.trim().length < 5) {\n" +
                "        alert('Please enter a description first so the AI can analyze it.');\n" +
                "        return;\n" +
                "      }\n" +
                "      try {\n" +
                "        const res = await fetch('/api/complaints/ai-classify', {\n" +
                "          method: 'POST',\n" +
                "          headers: { 'Content-Type': 'application/json' },\n" +
                "          body: JSON.stringify({ description: desc, location: loc })\n" +
                "        });\n" +
                "        const json = await res.json();\n" +
                "        if (json.data) {\n" +
                "          document.getElementById('newCategory').value = json.data.category;\n" +
                "          document.getElementById('newPriority').value = json.data.priority;\n" +
                "          const fb = document.getElementById('aiFeedbackBox');\n" +
                "          fb.innerHTML = `✨ <strong>AI Suggestion:</strong> Classified as <strong>${json.data.category}</strong> (${json.data.priority} Priority). Recommended team: ${json.data.assignedTeam}`;\n" +
                "          fb.style.display = 'block';\n" +
                "          checkDuplicate();\n" +
                "        }\n" +
                "      } catch (e) { alert(e.message); }\n" +
                "    }\n" +
                "\n" +
                "    async function submitComplaint() {\n" +
                "      if (currentRole === 'admin') {\n" +
                "        alert('Administrators manage complaints and cannot file complaints.');\n" +
                "        return;\n" +
                "      }\n" +
                "      const cat = document.getElementById('newCategory').value;\n" +
                "      const loc = document.getElementById('newLocation').value;\n" +
                "      const desc = document.getElementById('newDescription').value;\n" +
                "      const priority = document.getElementById('newPriority').value;\n" +
                "      const img = document.getElementById('newImageUrl').value;\n" +
                "\n" +
                "      try {\n" +
                "        const res = await fetch('/api/complaints', {\n" +
                "          method: 'POST',\n" +
                "          headers: { 'Content-Type': 'application/json' },\n" +
                "          body: JSON.stringify({ category: cat, location: loc, description: desc, priority, image_url: img })\n" +
                "        });\n" +
                "        if (res.ok) {\n" +
                "          closeModal('newModal');\n" +
                "          document.getElementById('newDescription').value = '';\n" +
                "          document.getElementById('newLocation').value = '';\n" +
                "          document.getElementById('aiFeedbackBox').style.display = 'none';\n" +
                "          loadComplaints();\n" +
                "          loadSummary();\n" +
                "        } else {\n" +
                "          const err = await res.json();\n" +
                "          alert(err.error || 'Failed to file complaint');\n" +
                "        }\n" +
                "      } catch (e) { alert(e.message); }\n" +
                "    }\n" +
                "\n" +
                "    async function openDetailModal(id) {\n" +
                "      try {\n" +
                "        const res = await fetch('/api/complaints/' + id);\n" +
                "        const json = await res.json();\n" +
                "        const c = json.data;\n" +
                "        if (!c) return;\n" +
                "        const num = String(c.complaint_number).padStart(4, '0');\n" +
                "        document.getElementById('detailTitle').textContent = `Audit Trail: #SCMS-${num}`;\n" +
                "        let html = `\n" +
                "          <div style=\"font-size:0.9rem; margin-bottom:1rem;\">\n" +
                "            <p><strong>Category:</strong> ${escapeHtml(c.category)} | <strong>Priority:</strong> ${escapeHtml(c.priority)}</p>\n" +
                "            <p><strong>Location:</strong> ${escapeHtml(c.location)}</p>\n" +
                "            <p style=\"margin-top:0.5rem;\"><strong>Description:</strong> ${escapeHtml(c.description)}</p>\n" +
                "          </div>\n" +
                "          <h4 style=\"font-size:0.85rem; text-transform:uppercase; color:var(--text-muted); margin-top:1.5rem;\">Status Transition History</h4>\n" +
                "          <ul class=\"audit-list\">\n" +
                "        `;\n" +
                "        if (c.history && c.history.length > 0) {\n" +
                "          html += c.history.map(h => `\n" +
                "            <li class=\"audit-item\">\n" +
                "              <strong>${escapeHtml(h.new_status)}</strong>: ${escapeHtml(h.note || 'No note')}\n" +
                "              <div style=\"font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;\">🕒 ${formatDate(h.updated_at)}</div>\n" +
                "            </li>\n" +
                "          `).join('');\n" +
                "        } else {\n" +
                "          html += '<li class=\"audit-item\">No history entries recorded yet.</li>';\n" +
                "        }\n" +
                "        html += '</ul>';\n" +
                "        document.getElementById('detailContent').innerHTML = html;\n" +
                "        openModal('detailModal');\n" +
                "      } catch (e) { alert(e.message); }\n" +
                "    }\n" +
                "\n" +
                "    function openTriageModal(id, currentStatus) {\n" +
                "      document.getElementById('detailTitle').textContent = 'Update Complaint Status & Assignment';\n" +
                "      document.getElementById('detailContent').innerHTML = `\n" +
                "        <div class=\"form-group\">\n" +
                "          <label class=\"form-label\">Status</label>\n" +
                "          <select id=\"triageStatus\">\n" +
                "            <option value=\"Pending\" ${currentStatus === 'Pending' ? 'selected' : ''}>Pending</option>\n" +
                "            <option value=\"In Progress\" ${currentStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>\n" +
                "            <option value=\"Resolved\" ${currentStatus === 'Resolved' ? 'selected' : ''}>Resolved</option>\n" +
                "            <option value=\"Rejected\" ${currentStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>\n" +
                "          </select>\n" +
                "        </div>\n" +
                "        <div class=\"form-group\">\n" +
                "          <label class=\"form-label\">Assigned Maintenance Unit / Staff</label>\n" +
                "          <input type=\"text\" id=\"triageAssignee\" placeholder=\"e.g. Electrical Team, Carpentry Unit\" />\n" +
                "        </div>\n" +
                "        <div class=\"form-group\">\n" +
                "          <label class=\"form-label\">Resolution Note</label>\n" +
                "          <textarea id=\"triageNote\" rows=\"2\" placeholder=\"Details on repairs done...\"></textarea>\n" +
                "        </div>\n" +
                "        <div style=\"display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;\">\n" +
                "          <button class=\"btn btn-outline\" onclick=\"closeModal('detailModal')\">Cancel</button>\n" +
                "          <button class=\"btn btn-primary\" onclick=\"submitTriage('${id}')\">Save Changes</button>\n" +
                "        </div>\n" +
                "      `;\n" +
                "      openModal('detailModal');\n" +
                "    }\n" +
                "\n" +
                "    async function submitTriage(id) {\n" +
                "      const status = document.getElementById('triageStatus').value;\n" +
                "      const assignedTo = document.getElementById('triageAssignee').value;\n" +
                "      const note = document.getElementById('triageNote').value;\n" +
                "      try {\n" +
                "        const res = await fetch(`/api/complaints/${id}/status`, {\n" +
                "          method: 'PATCH',\n" +
                "          headers: { 'Content-Type': 'application/json' },\n" +
                "          body: JSON.stringify({ status, assigned_to: assignedTo, resolution_note: note, note })\n" +
                "        });\n" +
                "        if (res.ok) {\n" +
                "          closeModal('detailModal');\n" +
                "          loadComplaints();\n" +
                "          loadSummary();\n" +
                "        } else {\n" +
                "          const err = await res.json();\n" +
                "          alert(err.error || 'Failed to update status');\n" +
                "        }\n" +
                "      } catch (e) { alert(e.message); }\n" +
                "    }\n" +
                "\n" +
                "    function exportCsv() {\n" +
                "      const status = document.getElementById('statusSelect').value;\n" +
                "      const category = document.getElementById('categorySelect').value;\n" +
                "      const priority = document.getElementById('prioritySelect').value;\n" +
                "      const search = document.getElementById('searchInput').value;\n" +
                "      let url = '/api/export/csv?';\n" +
                "      if (status !== 'all') url += 'status=' + encodeURIComponent(status) + '&';\n" +
                "      if (category !== 'all') url += 'category=' + encodeURIComponent(category) + '&';\n" +
                "      if (priority !== 'all') url += 'priority=' + encodeURIComponent(priority) + '&';\n" +
                "      if (search) url += 'search=' + encodeURIComponent(search);\n" +
                "      window.open(url, '_blank');\n" +
                "    }\n" +
                "\n" +
                "    function zoomImage(url) {\n" +
                "      document.getElementById('zoomImage').src = url;\n" +
                "      openModal('imageModal');\n" +
                "    }\n" +
                "\n" +
                "    function openNewModal() {\n" +
                "      if (currentRole === 'admin') {\n" +
                "        alert('Administrators manage campus complaints and cannot file new complaints.');\n" +
                "        return;\n" +
                "      }\n" +
                "      openModal('newModal');\n" +
                "    }\n" +
                "\n" +
                "    function openModal(id) { document.getElementById(id).classList.add('open'); }\n" +
                "    function closeModal(id) { document.getElementById(id).classList.remove('open'); }\n" +
                "\n" +
                "    function debounceSearch() {\n" +
                "      clearTimeout(searchTimeout);\n" +
                "      searchTimeout = setTimeout(loadComplaints, 300);\n" +
                "    }\n" +
                "\n" +
                "    function resetFilters() {\n" +
                "      document.getElementById('searchInput').value = '';\n" +
                "      document.getElementById('statusSelect').value = 'all';\n" +
                "      document.getElementById('categorySelect').value = 'all';\n" +
                "      document.getElementById('prioritySelect').value = 'all';\n" +
                "      loadComplaints();\n" +
                "    }\n" +
                "\n" +
                "    function escapeHtml(str) {\n" +
                "      if (!str) return '';\n" +
                "      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');\n" +
                "    }\n" +
                "\n" +
                "    function formatDate(iso) {\n" +
                "      if (!iso) return '';\n" +
                "      try {\n" +
                "        const d = new Date(iso);\n" +
                "        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });\n" +
                "      } catch (e) { return iso; }\n" +
                "    }\n" +
                "\n" +
                "    // Startup init\n" +
                "    updateRoleDisplay();\n" +
                "    loadSummary();\n" +
                "    loadComplaints();\n" +
                "  </script>\n" +
                "</body>\n" +
                "</html>";
    }
}
