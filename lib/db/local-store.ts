import fs from 'fs';
import path from 'path';
import { Complaint, ComplaintHistory, ReportSummary, Notification } from '@/lib/types';
import { CATEGORIES, PRIORITIES, Status, Priority, Category } from '@/lib/constants';
import { getComplaintSla } from '@/lib/sla';

interface StoredUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
}

interface LocalDatabaseData {
  users: StoredUser[];
  complaints: Complaint[];
  history: ComplaintHistory[];
  notifications: Notification[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'scms_data.json');

const INITIAL_USERS: StoredUser[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@college.edu',
    password: 'Password123!',
    full_name: 'Campus Administrator',
    role: 'admin',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'student@college.edu',
    password: 'Password123!',
    full_name: 'Alex Johnson',
    role: 'user',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'c0000001-0000-0000-0000-000000000001',
    complaint_number: 1,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Electrical',
    location: 'Block B, 3rd Floor, Room 304',
    description: 'Ceiling fan is making an intense buzzing noise and sparking occasionally when switched on high.',
    priority: 'High',
    status: 'In Progress',
    assigned_to: 'Maintenance - Electrical Team',
    resolution_note: null,
    image_url: null,
    resolution_image_url: null,
    rating: null,
    feedback_note: null,
    rated_at: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'c0000002-0000-0000-0000-000000000002',
    complaint_number: 2,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Water Supply',
    location: 'Hostel 3, Ground Floor Washroom',
    description: 'Main pipe leaking severely causing water logging in hallway.',
    priority: 'High',
    status: 'Resolved',
    assigned_to: 'Plumbing Dept',
    resolution_note: 'Main supply valve replaced and leak sealed. Hallway cleared.',
    image_url: null,
    resolution_image_url: null,
    rating: 5,
    feedback_note: 'Plumber came within 2 hours. Very fast resolution!',
    rated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'c0000003-0000-0000-0000-000000000003',
    complaint_number: 3,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Cleanliness',
    location: 'Central Library, 2nd Floor Reading Room',
    description: 'Waste bins have not been emptied for two days. Dust accumulating near window desks.',
    priority: 'Low',
    status: 'Pending',
    assigned_to: null,
    resolution_note: null,
    image_url: null,
    resolution_image_url: null,
    rating: null,
    feedback_note: null,
    rated_at: null,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'c0000004-0000-0000-0000-000000000004',
    complaint_number: 4,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Internet/IT',
    location: 'Department of Computer Science, Lab 2',
    description: 'Wi-Fi Access Point AP-CS-02 drops connection every 5 minutes during lab sessions.',
    priority: 'Medium',
    status: 'In Progress',
    assigned_to: 'Campus IT Network Cell',
    resolution_note: null,
    image_url: null,
    resolution_image_url: null,
    rating: null,
    feedback_note: null,
    rated_at: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'c0000005-0000-0000-0000-000000000005',
    complaint_number: 5,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Hostel Maintenance',
    location: 'Hostel 1, Room 112',
    description: 'Requesting a private refrigerator and customized air conditioner installation.',
    priority: 'Low',
    status: 'Rejected',
    assigned_to: null,
    resolution_note: 'Personal high-power appliances are strictly prohibited by college hostel bylaws.',
    image_url: null,
    resolution_image_url: null,
    rating: null,
    feedback_note: null,
    rated_at: null,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'c0000006-0000-0000-0000-000000000006',
    complaint_number: 6,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Laboratory Equipment',
    location: 'Physics Lab, Workbench 4',
    description: 'Digital oscilloscope power button is jammed and screen displays heavy distortion.',
    priority: 'Medium',
    status: 'Pending',
    assigned_to: null,
    resolution_note: null,
    image_url: null,
    resolution_image_url: null,
    rating: null,
    feedback_note: null,
    rated_at: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'c0000007-0000-0000-0000-000000000007',
    complaint_number: 7,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Infrastructure',
    location: 'Main Auditorium, Entrance Ramp',
    description: 'Handrail on the wheelchair access ramp is loose and poses a safety risk.',
    priority: 'High',
    status: 'Resolved',
    assigned_to: 'Estate Office - Civil Wing',
    resolution_note: 'Welded new reinforcement brackets and securely anchored to concrete base.',
    image_url: null,
    resolution_image_url: null,
    rating: 4,
    feedback_note: 'Handrail is now stable. Thanks!',
    rated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'c0000008-0000-0000-0000-000000000008',
    complaint_number: 8,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Other',
    location: 'Campus Cafeteria',
    description: 'Vending machine ate currency notes without dispensing items and displays error code E-04.',
    priority: 'Low',
    status: 'Pending',
    assigned_to: null,
    resolution_note: null,
    image_url: null,
    resolution_image_url: null,
    rating: null,
    feedback_note: null,
    rated_at: null,
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'c0000009-0000-0000-0000-000000000009',
    complaint_number: 9,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Electrical',
    location: 'Seminar Hall 1',
    description: 'Projector power socket sparks when HDMI or power cables are connected.',
    priority: 'High',
    status: 'Resolved',
    assigned_to: 'Maintenance - Electrical Team',
    resolution_note: 'Replaced shorted socket box and tested earthing resistance.',
    image_url: null,
    resolution_image_url: null,
    rating: 5,
    feedback_note: 'Prompt electrical repair before our seminar.',
    rated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'c0000010-0000-0000-0000-000000000010',
    complaint_number: 10,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Cleanliness',
    location: 'Sports Complex, Indoor Badminton Court',
    description: 'Roof leak during heavy rains left mud and puddle stains on synthetic court matting.',
    priority: 'Medium',
    status: 'In Progress',
    assigned_to: 'Housekeeping Supervisor',
    resolution_note: null,
    image_url: null,
    resolution_image_url: null,
    rating: null,
    feedback_note: null,
    rated_at: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'c0000011-0000-0000-0000-000000000011',
    complaint_number: 11,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Water Supply',
    location: 'Civil Engineering Block, 1st Floor',
    description: 'Water cooler filter light is blinking red and water has a metallic taste.',
    priority: 'Medium',
    status: 'Pending',
    assigned_to: null,
    resolution_note: null,
    image_url: null,
    resolution_image_url: null,
    rating: null,
    feedback_note: null,
    rated_at: null,
    created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
  {
    id: 'c0000012-0000-0000-0000-000000000012',
    complaint_number: 12,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Hostel Maintenance',
    location: 'Hostel 2, Room 218',
    description: 'Window latch is broken; window slams violently during wind and cannot be secured.',
    priority: 'Medium',
    status: 'In Progress',
    assigned_to: 'Carpentry Unit',
    resolution_note: null,
    image_url: null,
    resolution_image_url: null,
    rating: null,
    feedback_note: null,
    rated_at: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 'c0000013-0000-0000-0000-000000000013',
    complaint_number: 13,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Internet/IT',
    location: 'Hostel 4, Common Room',
    description: 'Ethernet LAN port number 04 is dead. No link light detected on connected laptops.',
    priority: 'Low',
    status: 'Resolved',
    assigned_to: 'Campus IT Network Cell',
    resolution_note: 'Crimped new RJ45 termination and verified patch panel connection at switch SW-H4-01.',
    image_url: null,
    resolution_image_url: null,
    rating: 5,
    feedback_note: 'LAN is super fast now.',
    rated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'c0000014-0000-0000-0000-000000000014',
    complaint_number: 14,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Laboratory Equipment',
    location: 'Chemistry Research Lab 102',
    description: 'Fume hood airflow velocity sensor error; alarm is beeping continuously.',
    priority: 'High',
    status: 'In Progress',
    assigned_to: 'Lab Safety & Instrumentation',
    resolution_note: null,
    image_url: null,
    resolution_image_url: null,
    rating: null,
    feedback_note: null,
    rated_at: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'c0000015-0000-0000-0000-000000000015',
    complaint_number: 15,
    user_id: '22222222-2222-2222-2222-222222222222',
    category: 'Infrastructure',
    location: 'North Gate Parking Area',
    description: 'Pothole near the bicycle stand is deepening and causes water pooling.',
    priority: 'Low',
    status: 'Pending',
    assigned_to: null,
    resolution_note: null,
    image_url: null,
    resolution_image_url: null,
    rating: null,
    feedback_note: null,
    rated_at: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const INITIAL_HISTORY: ComplaintHistory[] = [
  {
    id: 'h0000001-0000-0000-0000-000000000001',
    complaint_id: 'c0000001-0000-0000-0000-000000000001',
    old_status: null,
    new_status: 'Pending',
    note: 'Complaint registered by student',
    updated_by: '22222222-2222-2222-2222-222222222222',
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'h0000001-0000-0000-0000-000000000002',
    complaint_id: 'c0000001-0000-0000-0000-000000000001',
    old_status: 'Pending',
    new_status: 'In Progress',
    note: 'Assigned to electrician Ramesh. Capacitor replacement scheduled.',
    updated_by: '11111111-1111-1111-1111-111111111111',
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'h0000002-0000-0000-0000-000000000001',
    complaint_id: 'c0000002-0000-0000-0000-000000000002',
    old_status: null,
    new_status: 'Pending',
    note: 'Complaint registered',
    updated_by: '22222222-2222-2222-2222-222222222222',
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'h0000002-0000-0000-0000-000000000002',
    complaint_id: 'c0000002-0000-0000-0000-000000000002',
    old_status: 'Pending',
    new_status: 'In Progress',
    note: 'Plumbing crew dispatched',
    updated_by: '11111111-1111-1111-1111-111111111111',
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'h0000002-0000-0000-0000-000000000003',
    complaint_id: 'c0000002-0000-0000-0000-000000000002',
    old_status: 'In Progress',
    new_status: 'Resolved',
    note: 'Main supply valve replaced and leak sealed.',
    updated_by: '11111111-1111-1111-1111-111111111111',
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n0000001-0000-0000-0000-000000000001',
    user_id: 'admin',
    title: 'New Complaint Filed',
    message: 'Complaint #SCMS-0003 (Cleanliness) logged in Central Library.',
    link: '/admin/complaints/c0000003-0000-0000-0000-000000000003',
    read: false,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'n0000002-0000-0000-0000-000000000002',
    user_id: '22222222-2222-2222-2222-222222222222',
    title: 'Complaint Resolved',
    message: 'Your complaint #SCMS-0002 (Water Supply) has been marked Resolved.',
    link: '/complaints/c0000002-0000-0000-0000-000000000002',
    read: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

function loadDatabase(): LocalDatabaseData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (!parsed.notifications) parsed.notifications = INITIAL_NOTIFICATIONS;
      return parsed;
    }
  } catch (e) {
    console.error('Error reading local database file:', e);
  }

  const initial: LocalDatabaseData = {
    users: INITIAL_USERS,
    complaints: INITIAL_COMPLAINTS,
    history: INITIAL_HISTORY,
    notifications: INITIAL_NOTIFICATIONS,
  };
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: LocalDatabaseData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving local database file:', e);
  }
}

export const localStore = {
  findUserByEmail(email: string): StoredUser | undefined {
    const db = loadDatabase();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById(id: string): StoredUser | undefined {
    const db = loadDatabase();
    return db.users.find((u) => u.id === id);
  },

  createUser(email: string, password: string, fullName: string): StoredUser {
    const db = loadDatabase();
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      password,
      full_name: fullName,
      role: 'user',
      created_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveDatabase(db);
    return newUser;
  },

  getComplaints(filters: {
    userId?: string;
    isAdmin?: boolean;
    status?: string | null;
    category?: string | null;
    priority?: string | null;
    search?: string | null;
  }): Complaint[] {
    const db = loadDatabase();
    let list = [...db.complaints];

    if (!filters.isAdmin && filters.userId) {
      list = list.filter((c) => c.user_id === filters.userId);
    }

    if (filters.status && filters.status !== 'all') {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters.category && filters.category !== 'all') {
      list = list.filter((c) => c.category === filters.category);
    }
    if (filters.priority && filters.priority !== 'all') {
      list = list.filter((c) => c.priority === filters.priority);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const numMatch = q.replace(/[^0-9]/g, '');
      const searchNum = numMatch ? parseInt(numMatch, 10) : NaN;

      list = list.filter((c) => {
        if (!isNaN(searchNum) && c.complaint_number === searchNum) return true;
        return (
          c.location.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        );
      });
    }

    const enriched = list.map((c) => {
      const u = db.users.find((user) => user.id === c.user_id);
      return {
        ...c,
        user: u
          ? {
              id: u.id,
              full_name: u.full_name,
              email: u.email,
              role: u.role,
              created_at: u.created_at,
            }
          : undefined,
      };
    });

    return enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getComplaintById(id: string): (Complaint & { history: ComplaintHistory[] }) | null {
    const db = loadDatabase();
    const complaint = db.complaints.find((c) => c.id === id);
    if (!complaint) return null;

    const reporter = db.users.find((u) => u.id === complaint.user_id);
    const history = db.history
      .filter((h) => h.complaint_id === id)
      .map((h) => {
        const updater = db.users.find((u) => u.id === h.updated_by);
        return {
          ...h,
          updater: updater
            ? {
                id: updater.id,
                full_name: updater.full_name,
                email: updater.email,
                role: updater.role,
                created_at: updater.created_at,
              }
            : undefined,
        };
      })
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return {
      ...complaint,
      user: reporter
        ? {
            id: reporter.id,
            full_name: reporter.full_name,
            email: reporter.email,
            role: reporter.role,
            created_at: reporter.created_at,
          }
        : undefined,
      history,
    };
  },

  createComplaint(data: {
    userId: string;
    category: Category;
    location: string;
    description: string;
    priority: Priority;
    image_url?: string | null;
  }): Complaint {
    const db = loadDatabase();
    const maxNum = db.complaints.reduce((max, c) => Math.max(max, c.complaint_number || 0), 0);
    const newNum = maxNum + 1;
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id: crypto.randomUUID(),
      complaint_number: newNum,
      user_id: data.userId,
      category: data.category,
      location: data.location,
      description: data.description,
      priority: data.priority,
      status: 'Pending',
      assigned_to: null,
      resolution_note: null,
      image_url: data.image_url || null,
      resolution_image_url: null,
      rating: null,
      feedback_note: null,
      rated_at: null,
      created_at: now,
      updated_at: now,
    };

    const initialHistory: ComplaintHistory = {
      id: crypto.randomUUID(),
      complaint_id: newComplaint.id,
      old_status: null,
      new_status: 'Pending',
      note: 'Complaint registered by student',
      updated_by: data.userId,
      updated_at: now,
    };

    db.complaints.push(newComplaint);
    db.history.push(initialHistory);

    // Create Notification for Administrators
    db.notifications.unshift({
      id: crypto.randomUUID(),
      user_id: 'admin',
      title: 'New Complaint Filed',
      message: `Complaint #SCMS-${String(newNum).padStart(4, '0')} (${data.category}) reported at ${data.location}.`,
      link: `/admin/complaints/${newComplaint.id}`,
      read: false,
      created_at: now,
    });

    saveDatabase(db);
    return newComplaint;
  },

  updateComplaintStatus(
    id: string,
    update: {
      status: Status;
      assigned_to?: string | null;
      resolution_note?: string | null;
      resolution_image_url?: string | null;
      note?: string;
    },
    adminId: string
  ): Complaint | null {
    const db = loadDatabase();
    const idx = db.complaints.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const oldStatus = db.complaints[idx].status;
    const now = new Date().toISOString();

    db.complaints[idx] = {
      ...db.complaints[idx],
      status: update.status,
      assigned_to: update.assigned_to !== undefined ? update.assigned_to : db.complaints[idx].assigned_to,
      resolution_note: update.resolution_note !== undefined ? update.resolution_note : db.complaints[idx].resolution_note,
      resolution_image_url: update.resolution_image_url !== undefined ? update.resolution_image_url : db.complaints[idx].resolution_image_url,
      updated_at: now,
    };

    const historyEntry: ComplaintHistory = {
      id: crypto.randomUUID(),
      complaint_id: id,
      old_status: oldStatus,
      new_status: update.status,
      note: update.note || (oldStatus !== update.status ? `Status updated to ${update.status}` : 'Complaint details updated'),
      updated_by: adminId,
      updated_at: now,
    };

    db.history.push(historyEntry);

    // Notify Student of status change
    const complaintNumber = String(db.complaints[idx].complaint_number).padStart(4, '0');
    db.notifications.unshift({
      id: crypto.randomUUID(),
      user_id: db.complaints[idx].user_id,
      title: `Complaint #SCMS-${complaintNumber} Updated`,
      message: `Status changed to "${update.status}". ${update.resolution_note ? `Note: ${update.resolution_note}` : ''}`,
      link: `/complaints/${id}`,
      read: false,
      created_at: now,
    });

    saveDatabase(db);
    return db.complaints[idx];
  },

  addFeedback(
    complaintId: string,
    rating: number,
    feedbackNote: string,
    studentId: string
  ): Complaint | null {
    const db = loadDatabase();
    const idx = db.complaints.findIndex((c) => c.id === complaintId);
    if (idx === -1) return null;

    if (db.complaints[idx].user_id !== studentId) {
      return null;
    }

    const now = new Date().toISOString();
    db.complaints[idx].rating = rating;
    db.complaints[idx].feedback_note = feedbackNote || null;
    db.complaints[idx].rated_at = now;

    // Notify Administrator of rating
    const complaintNumber = String(db.complaints[idx].complaint_number).padStart(4, '0');
    db.notifications.unshift({
      id: crypto.randomUUID(),
      user_id: 'admin',
      title: `Feedback Received for #SCMS-${complaintNumber}`,
      message: `Student submitted a ${rating}-star rating: "${feedbackNote || 'No comment'}"`,
      link: `/admin/complaints/${complaintId}`,
      read: false,
      created_at: now,
    });

    saveDatabase(db);
    return db.complaints[idx];
  },

  getNotifications(userId: string, isAdmin: boolean): Notification[] {
    const db = loadDatabase();
    return db.notifications
      .filter((n) => (isAdmin && n.user_id === 'admin') || n.user_id === userId)
      .slice(0, 30);
  },

  markNotificationsAsRead(userId: string, isAdmin: boolean): void {
    const db = loadDatabase();
    db.notifications = db.notifications.map((n) => {
      if ((isAdmin && n.user_id === 'admin') || n.user_id === userId) {
        return { ...n, read: true };
      }
      return n;
    });
    saveDatabase(db);
  },

  getSummary(): ReportSummary {
    const db = loadDatabase();
    const total = db.complaints.length;
    const pending = db.complaints.filter((c) => c.status === 'Pending').length;
    const inProgress = db.complaints.filter((c) => c.status === 'In Progress').length;
    const resolved = db.complaints.filter((c) => c.status === 'Resolved').length;
    const rejected = db.complaints.filter((c) => c.status === 'Rejected').length;

    // SLA Overdue calculation
    const overdue = db.complaints.filter((c) => {
      const sla = getComplaintSla(c);
      return sla.isOverdue && !sla.isCompleted;
    }).length;

    // Ratings calculation
    const ratedComplaints = db.complaints.filter((c) => typeof c.rating === 'number' && c.rating > 0);
    const totalRatings = ratedComplaints.length;
    const averageRating = totalRatings > 0
      ? Number((ratedComplaints.reduce((acc, c) => acc + (c.rating || 0), 0) / totalRatings).toFixed(1))
      : null;

    const byCategory = CATEGORIES.map((cat) => ({
      category: cat,
      count: db.complaints.filter((c) => c.category === cat).length,
    }));

    const byPriority = PRIORITIES.map((p) => ({
      priority: p,
      count: db.complaints.filter((c) => c.priority === p).length,
    }));

    return {
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      overdue,
      averageRating,
      totalRatings,
      byCategory,
      byPriority,
    };
  },
};
