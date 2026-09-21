-- ============================================================================
-- SCMS Seed Data (Sample Complaints and Role Promotion)
-- ============================================================================

-- NOTE on Auth Users:
-- Supabase best practice is to create auth users via the Supabase Dashboard,
-- Supabase CLI (`supabase auth users create`), or the Admin API:
--
-- Admin Account:
--   Email: admin@college.edu
--   Password: Password123!
--   Full Name: Campus Administrator
--
-- Student Account:
--   Email: student@college.edu
--   Password: Password123!
--   Full Name: Alex Johnson
--
-- Once signed up / created, promote the admin user by running:
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@college.edu';

-- ============================================================================
-- Sample Data Insertion Helper
-- If you are running in a local environment or SQL Editor where auth.users
-- already has the accounts, this script will populate realistic complaints.
-- ============================================================================

DO $$
DECLARE
  v_admin_id uuid;
  v_user_id uuid;
  v_c1_id uuid;
  v_c2_id uuid;
  v_c3_id uuid;
  v_c4_id uuid;
  v_c5_id uuid;
  v_c6_id uuid;
  v_c7_id uuid;
  v_c8_id uuid;
  v_c9_id uuid;
  v_c10_id uuid;
  v_c11_id uuid;
  v_c12_id uuid;
  v_c13_id uuid;
  v_c14_id uuid;
  v_c15_id uuid;
BEGIN
  -- Retrieve user IDs from profiles (or pick any existing profile if testing)
  SELECT id INTO v_admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
  SELECT id INTO v_user_id FROM public.profiles WHERE role = 'user' LIMIT 1;

  -- Fallback: if no profile exists yet, create dummy profile entries for local testing
  IF v_admin_id IS NULL THEN
    -- In standard Supabase, auth.users must exist first. If running local tests,
    -- this will be populated once admin@college.edu is created.
    RETURN;
  END IF;

  IF v_user_id IS NULL THEN
    v_user_id := v_admin_id;
  END IF;

  -- 1. Electrical - In Progress
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, assigned_to, created_at, updated_at
  ) VALUES (
    v_user_id, 'Electrical', 'Block B, 3rd Floor, Room 304',
    'Ceiling fan is making an intense buzzing noise and sparking occasionally when switched on high.',
    'High', 'In Progress', 'Maintenance - Electrical Team',
    now() - interval '3 days', now() - interval '1 day'
  ) RETURNING id INTO v_c1_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES
    (v_c1_id, NULL, 'Pending', 'Complaint registered by student', v_user_id, now() - interval '3 days'),
    (v_c1_id, 'Pending', 'In Progress', 'Assigned to electrician Ramesh. Capacitor replacement scheduled.', v_admin_id, now() - interval '1 day');

  -- 2. Water Supply - Resolved
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, assigned_to, resolution_note, created_at, updated_at
  ) VALUES (
    v_user_id, 'Water Supply', 'Hostel 3, Ground Floor Washroom',
    'Main pipe leaking severely causing water logging in hallway.',
    'High', 'Resolved', 'Plumbing Dept',
    'Main supply valve replaced and leak sealed. Hallway cleared.',
    now() - interval '5 days', now() - interval '2 days'
  ) RETURNING id INTO v_c2_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES
    (v_c2_id, NULL, 'Pending', 'Complaint registered', v_user_id, now() - interval '5 days'),
    (v_c2_id, 'Pending', 'In Progress', 'Plumber dispatched', v_admin_id, now() - interval '4 days'),
    (v_c2_id, 'In Progress', 'Resolved', 'Valve replaced and pipe sealed', v_admin_id, now() - interval '2 days');

  -- 3. Cleanliness - Pending
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, created_at
  ) VALUES (
    v_user_id, 'Cleanliness', 'Central Library, 2nd Floor Reading Room',
    'Waste bins have not been emptied for two days. Dust accumulating near window desks.',
    'Low', 'Pending', now() - interval '4 hours'
  ) RETURNING id INTO v_c3_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES (v_c3_id, NULL, 'Pending', 'Complaint registered', v_user_id, now() - interval '4 hours');

  -- 4. Internet/IT - In Progress
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, assigned_to, created_at, updated_at
  ) VALUES (
    v_user_id, 'Internet/IT', 'Department of Computer Science, Lab 2',
    'Wi-Fi Access Point AP-CS-02 drops connection every 5 minutes during lab sessions.',
    'Medium', 'In Progress', 'Campus IT Network Cell',
    now() - interval '2 days', now() - interval '6 hours'
  ) RETURNING id INTO v_c4_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES
    (v_c4_id, NULL, 'Pending', 'Complaint registered', v_user_id, now() - interval '2 days'),
    (v_c4_id, 'Pending', 'In Progress', 'Firmware update required on AP-CS-02', v_admin_id, now() - interval '6 hours');

  -- 5. Hostel Maintenance - Rejected
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, resolution_note, created_at, updated_at
  ) VALUES (
    v_user_id, 'Hostel Maintenance', 'Hostel 1, Room 112',
    'Requesting a private refrigerator and customized air conditioner installation.',
    'Low', 'Rejected',
    'Personal high-power appliances are strictly prohibited by college hostel bylaws.',
    now() - interval '4 days', now() - interval '3 days'
  ) RETURNING id INTO v_c5_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES
    (v_c5_id, NULL, 'Pending', 'Complaint registered', v_user_id, now() - interval '4 days'),
    (v_c5_id, 'Pending', 'Rejected', 'Violates hostel policy section 4.2', v_admin_id, now() - interval '3 days');

  -- 6. Laboratory Equipment - Pending
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, created_at
  ) VALUES (
    v_user_id, 'Laboratory Equipment', 'Physics Lab, Workbench 4',
    'Digital oscilloscope power button is jammed and screen displays heavy distortion.',
    'Medium', 'Pending', now() - interval '1 day'
  ) RETURNING id INTO v_c6_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES (v_c6_id, NULL, 'Pending', 'Complaint registered', v_user_id, now() - interval '1 day');

  -- 7. Infrastructure - Resolved
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, assigned_to, resolution_note, created_at, updated_at
  ) VALUES (
    v_user_id, 'Infrastructure', 'Main Auditorium, Entrance Ramp',
    'Handrail on the wheelchair access ramp is loose and poses a safety risk.',
    'High', 'Resolved', 'Estate Office - Civil Wing',
    'Welded new reinforcement brackets and securely anchored to concrete base.',
    now() - interval '7 days', now() - interval '4 days'
  ) RETURNING id INTO v_c7_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES
    (v_c7_id, NULL, 'Pending', 'Complaint registered', v_user_id, now() - interval '7 days'),
    (v_c7_id, 'Pending', 'In Progress', 'Inspection team sent', v_admin_id, now() - interval '6 days'),
    (v_c7_id, 'In Progress', 'Resolved', 'Welding and anchoring completed', v_admin_id, now() - interval '4 days');

  -- 8. Other - Pending
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, created_at
  ) VALUES (
    v_user_id, 'Other', 'Campus Cafeteria',
    'Vending machine ate currency notes without dispensing items and displays error code E-04.',
    'Low', 'Pending', now() - interval '12 hours'
  ) RETURNING id INTO v_c8_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES (v_c8_id, NULL, 'Pending', 'Complaint registered', v_user_id, now() - interval '12 hours');

  -- 9. Electrical - Resolved
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, assigned_to, resolution_note, created_at, updated_at
  ) VALUES (
    v_user_id, 'Electrical', 'Seminar Hall 1',
    'Projector power socket sparks when HDMI or power cables are connected.',
    'High', 'Resolved', 'Maintenance - Electrical Team',
    'Replaced shorted socket box and tested earthing resistance.',
    now() - interval '6 days', now() - interval '3 days'
  ) RETURNING id INTO v_c9_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES
    (v_c9_id, NULL, 'Pending', 'Complaint registered', v_user_id, now() - interval '6 days'),
    (v_c9_id, 'Pending', 'Resolved', 'Emergency repair completed by on-duty technician', v_admin_id, now() - interval '3 days');

  -- 10. Cleanliness - In Progress
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, assigned_to, created_at, updated_at
  ) VALUES (
    v_user_id, 'Cleanliness', 'Sports Complex, Indoor Badminton Court',
    'Roof leak during heavy rains left mud and puddle stains on synthetic court matting.',
    'Medium', 'In Progress', 'Housekeeping Supervisor',
    now() - interval '2 days', now() - interval '1 day'
  ) RETURNING id INTO v_c10_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES
    (v_c10_id, NULL, 'Pending', 'Complaint registered', v_user_id, now() - interval '2 days'),
    (v_c10_id, 'Pending', 'In Progress', 'Specialized dry-cleaning crew engaged', v_admin_id, now() - interval '1 day');

  -- 11. Water Supply - Pending
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, created_at
  ) VALUES (
    v_user_id, 'Water Supply', 'Civil Engineering Block, 1st Floor',
    'Water cooler filter light is blinking red and water has a metallic taste.',
    'Medium', 'Pending', now() - interval '18 hours'
  ) RETURNING id INTO v_c11_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES (v_c11_id, NULL, 'Pending', 'Complaint registered', v_user_id, now() - interval '18 hours');

  -- 12. Hostel Maintenance - In Progress
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, assigned_to, created_at, updated_at
  ) VALUES (
    v_user_id, 'Hostel Maintenance', 'Hostel 2, Room 218',
    'Window latch is broken; window slams violently during wind and cannot be secured.',
    'Medium', 'In Progress', 'Carpentry Unit',
    now() - interval '1 day', now() - interval '8 hours'
  ) RETURNING id INTO v_c12_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES
    (v_c12_id, NULL, 'Pending', 'Complaint registered', v_user_id, now() - interval '1 day'),
    (v_c12_id, 'Pending', 'In Progress', 'Carpenter Kumar assigned', v_admin_id, now() - interval '8 hours');

  -- 13. Internet/IT - Resolved
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, assigned_to, resolution_note, created_at, updated_at
  ) VALUES (
    v_user_id, 'Internet/IT', 'Hostel 4, Common Room',
    'Ethernet LAN port number 04 is dead. No link light detected on connected laptops.',
    'Low', 'Resolved', 'Campus IT Network Cell',
    'Crimped new RJ45 termination and verified patch panel connection at switch SW-H4-01.',
    now() - interval '8 days', now() - interval '5 days'
  ) RETURNING id INTO v_c13_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES
    (v_c13_id, NULL, 'Pending', 'Complaint registered', v_user_id, now() - interval '8 days'),
    (v_c13_id, 'Pending', 'Resolved', 'Port re-punched and tested with cable tester', v_admin_id, now() - interval '5 days');

  -- 14. Laboratory Equipment - In Progress
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, assigned_to, created_at, updated_at
  ) VALUES (
    v_user_id, 'Laboratory Equipment', 'Chemistry Research Lab 102',
    'Fume hood airflow velocity sensor error; alarm is beeping continuously.',
    'High', 'In Progress', 'Lab Safety & Instrumentation',
    now() - interval '1 day', now() - interval '4 hours'
  ) RETURNING id INTO v_c14_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES
    (v_c14_id, NULL, 'Pending', 'Complaint registered', v_user_id, now() - interval '1 day'),
    (v_c14_id, 'Pending', 'In Progress', 'OEM technician contacted for sensor calibration', v_admin_id, now() - interval '4 hours');

  -- 15. Infrastructure - Pending
  INSERT INTO public.complaints (
    user_id, category, location, description, priority, status, created_at
  ) VALUES (
    v_user_id, 'Infrastructure', 'North Gate Parking Area',
    'Pothole near the bicycle stand is deepening and causes water pooling.',
    'Low', 'Pending', now() - interval '2 days'
  ) RETURNING id INTO v_c15_id;

  INSERT INTO public.complaint_history (complaint_id, old_status, new_status, note, updated_by, updated_at)
  VALUES (v_c15_id, NULL, 'Pending', 'Complaint registered', v_user_id, now() - interval '2 days');

END $$;
