-- =============================================================================
-- RAMOLA COACHING CENTRE - COMPREHENSIVE SUPABASE DATABASE SCHEMA & SECURITY AUDIT
-- Learn • Practice • Improve
-- Production-ready PostgreSQL schema with RLS policies, triggers, and RBAC.
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. ENUMS & DOMAINS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT', 'COUNSELLOR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE access_status AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED', 'PENDING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE content_type AS ENUM ('YOUTUBE_VIDEO', 'DRIVE_DOC', 'PDF', 'WORKSHEET', 'QUESTION_PAPER', 'SOLUTION', 'EXTERNAL_LINK');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'LEAVE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE doubt_status AS ENUM ('OPEN', 'IN_PROGRESS', 'ANSWERED', 'RESOLVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- 2. USER PROFILES & AUTH SYNCHRONIZATION
-- =============================================================================
-- Profiles table links directly to Supabase auth.users(id).
-- A user's role and status CANNOT be altered by the user themselves.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'STUDENT',
  phone TEXT,
  avatar_url TEXT,
  status access_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: Prevent unauthorized role or status tampering on public.profiles
CREATE OR REPLACE FUNCTION public.check_profile_role_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If role or status is being altered:
  IF (OLD.role IS DISTINCT FROM NEW.role) OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Only an authenticated SUPER_ADMIN can alter roles or status
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    ) THEN
      RAISE EXCEPTION 'Security Violation: Only authenticated SUPER_ADMIN can modify user roles or account status.';
    END IF;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_roles ON public.profiles;
CREATE TRIGGER trg_protect_profile_roles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_role_update();

-- Automatic profile provisioner upon Supabase Auth sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student ' || SUBSTRING(NEW.id::TEXT, 1, 6)),
    -- DEFAULT IS ALWAYS STUDENT: Users can never sign themselves up as SUPER_ADMIN or TEACHER
    'STUDENT',
    'ACTIVE'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create corresponding student row
  INSERT INTO public.students (id, roll_number)
  VALUES (
    NEW.id,
    'RCC-' || TO_CHAR(NOW(), 'YY') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 3. SECURE SUPER ADMIN BOOTSTRAP PROCEDURE
-- =============================================================================
-- Documented Super Admin bootstrap: Run this securely in the Supabase SQL editor
-- to designate the official Director account. It cannot be called by normal users via the API.
CREATE OR REPLACE FUNCTION public.bootstrap_super_admin(admin_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_existing_super_admin_count INT;
BEGIN
  -- Security Guard 1: Verify execution authority
  -- Only allow direct execution by database administrator (postgres / service_role)
  -- or an existing verified SUPER_ADMIN
  IF current_user NOT IN ('postgres', 'supabase_admin') 
     AND current_setting('role', true) NOT IN ('service_role', 'postgres')
     AND NOT EXISTS (
       SELECT 1 FROM public.profiles
       WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
     ) THEN
    RAISE EXCEPTION 'Access Denied: bootstrap_super_admin can only be executed via Supabase SQL Editor or by service_role.';
  END IF;

  -- Security Guard 2: If a Super Admin already exists, prevent unauthorized re-bootstrapping
  SELECT COUNT(*) INTO v_existing_super_admin_count
  FROM public.profiles
  WHERE role = 'SUPER_ADMIN';

  IF v_existing_super_admin_count > 0 AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  ) AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'Security Alert: A Super Admin is already established. Only existing Super Admin or direct DB admin can assign new admins.';
  END IF;

  SELECT id INTO v_user_id FROM public.profiles WHERE LOWER(email) = LOWER(TRIM(admin_email));
  IF v_user_id IS NULL THEN
    RETURN 'Error: Profile with email ' || admin_email || ' does not exist yet. Please have the user sign up first.';
  END IF;

  UPDATE public.profiles
  SET role = 'SUPER_ADMIN', status = 'ACTIVE'
  WHERE id = v_user_id;

  RETURN 'Success: Account ' || admin_email || ' (UUID: ' || v_user_id || ') is now verified SUPER_ADMIN.';
END;
$$;

-- Security Guard 3: Explicitly revoke execute privileges from public, anon, and authenticated users
REVOKE EXECUTE ON FUNCTION public.bootstrap_super_admin(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bootstrap_super_admin(TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bootstrap_super_admin(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_super_admin(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.bootstrap_super_admin(TEXT) TO postgres;

-- =============================================================================
-- 4. TEACHERS & PERMISSION MATRIX
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  qualification TEXT,
  bio TEXT,
  specializations TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teacher_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(teacher_id, permission)
);

-- Teacher Invitations (Secure faculty onboarding)
CREATE TABLE IF NOT EXISTS public.teacher_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES public.profiles(id),
  assigned_course_ids UUID[],
  granted_permissions TEXT[],
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 5. COURSES, SUBJECTS, CHAPTERS & TOPICS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'ACADEMIC',
  level TEXT NOT NULL,
  duration TEXT,
  fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  thumbnail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  timing TEXT,
  room_or_link TEXT,
  max_students INT DEFAULT 40,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  chapter_number INT NOT NULL DEFAULT 1,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  topic_number INT NOT NULL DEFAULT 1,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teacher Course & Batch Assignments (Enforces teacher scope)
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(teacher_id, course_id, batch_id, subject_id)
);

-- =============================================================================
-- 6. STUDENTS, PARENTS & ENROLLMENT ACCESS (ACCESS CONTROL LIFECYCLE)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  roll_number TEXT UNIQUE,
  school_name TEXT,
  target_exam TEXT,
  current_level TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.parent_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relation TEXT DEFAULT 'Parent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  status access_status NOT NULL DEFAULT 'ACTIVE',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  granted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- =============================================================================
-- 7. EXTERNAL CONTENT (YOUTUBE & GOOGLE DRIVE SECURITY BOUNDARY)
-- =============================================================================
-- NOTE: YouTube videos and Google Drive documents are strictly external.
-- Supabase stores metadata, access relationships, and IDs.
CREATE TABLE IF NOT EXISTS public.course_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type content_type NOT NULL,
  url TEXT NOT NULL,
  external_id TEXT, -- YouTube Video ID or Google Drive file ID
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  duration_minutes INT,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 8. TESTS, OFFLINE RESULTS & MISTAKE ANALYSIS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.mistake_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  test_type TEXT NOT NULL DEFAULT 'OFFLINE',
  duration_minutes INT DEFAULT 60,
  max_marks NUMERIC(6, 2) NOT NULL DEFAULT 100,
  pass_marks NUMERIC(6, 2) NOT NULL DEFAULT 40,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.test_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'MCQ',
  options JSONB,
  correct_answer TEXT,
  marks NUMERIC(4, 2) NOT NULL DEFAULT 1,
  explanation TEXT,
  order_index INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score NUMERIC(6, 2) NOT NULL,
  max_marks NUMERIC(6, 2) NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offline_test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entered_by UUID REFERENCES public.profiles(id),
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  marks_obtained NUMERIC(6, 2) NOT NULL CHECK (marks_obtained >= 0),
  max_marks NUMERIC(6, 2) NOT NULL CHECK (max_marks > 0),
  percentage NUMERIC(5, 2) NOT NULL,
  teacher_remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_offline_marks_bounds CHECK (marks_obtained <= max_marks)
);

CREATE TABLE IF NOT EXISTS public.result_mistakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id UUID NOT NULL REFERENCES public.offline_test_results(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.mistake_categories(id) ON DELETE CASCADE,
  mistake_count INT NOT NULL DEFAULT 0 CHECK (mistake_count >= 0 AND mistake_count <= 200),
  note TEXT
);

CREATE TABLE IF NOT EXISTS public.question_level_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id UUID NOT NULL REFERENCES public.offline_test_results(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  status TEXT NOT NULL,
  mistake_category_id UUID REFERENCES public.mistake_categories(id),
  note TEXT
);

-- =============================================================================
-- 9. HOMEWORK, DOUBTS, ATTENDANCE & FEES
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.homework (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id),
  chapter_id UUID REFERENCES public.chapters(id),
  teacher_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  drive_link TEXT,
  max_marks NUMERIC(6, 2),
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.homework_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  homework_id UUID NOT NULL REFERENCES public.homework(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  submission_link TEXT,
  submission_text TEXT,
  submitted_at TIMESTAMPTZ,
  marks_awarded NUMERIC(6, 2),
  teacher_feedback TEXT,
  status TEXT NOT NULL DEFAULT 'ASSIGNED',
  UNIQUE(homework_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.doubts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id),
  chapter_id UUID REFERENCES public.chapters(id),
  topic TEXT,
  question TEXT NOT NULL,
  image_url TEXT,
  status doubt_status NOT NULL DEFAULT 'OPEN',
  answered_by UUID REFERENCES public.profiles(id),
  answer_text TEXT,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL DEFAULT 'PRESENT',
  marked_by UUID REFERENCES public.profiles(id),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id, date)
);

CREATE TABLE IF NOT EXISTS public.fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  total_fee NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  final_fee NUMERIC(10, 2) NOT NULL,
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  balance NUMERIC(10, 2) NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'PARTIAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.fee_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fee_id UUID NOT NULL REFERENCES public.fees(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method payment_method NOT NULL DEFAULT 'CASH',
  transaction_ref TEXT,
  received_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 10. AI ANALYSIS, PROGRESS REPORTS & ANNOUNCEMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id),
  analysis_data JSONB NOT NULL,
  generated_by UUID REFERENCES public.profiles(id),
  is_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  is_shared_with_student BOOLEAN NOT NULL DEFAULT FALSE,
  is_shared_with_parent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.progress_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id),
  period TEXT NOT NULL,
  attendance_summary JSONB,
  academic_summary JSONB,
  mistake_summary JSONB,
  teacher_remarks TEXT,
  ai_analysis_id UUID REFERENCES public.ai_analyses(id),
  is_shared_student BOOLEAN NOT NULL DEFAULT FALSE,
  is_shared_parent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'ALL',
  target_id UUID,
  attachment_url TEXT,
  published_by UUID REFERENCES public.profiles(id),
  publish_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  type TEXT NOT NULL DEFAULT 'GENERAL',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id),
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name TEXT NOT NULL,
  parent_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  course_interested TEXT NOT NULL,
  class_level TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'NEW',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 11. INDEXES FOR QUERY OPTIMIZATION
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_lookup ON public.teacher_assignments(teacher_id, course_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_parent ON public.parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_contents_course ON public.course_contents(course_id, is_published);
CREATE INDEX IF NOT EXISTS idx_offline_results_student ON public.offline_test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_offline_results_test ON public.offline_test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_homework_course ON public.homework(course_id);
CREATE INDEX IF NOT EXISTS idx_homework_submissions ON public.homework_submissions(homework_id, student_id);
CREATE INDEX IF NOT EXISTS idx_doubts_student ON public.doubts(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- =============================================================================
-- 12. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS (SECURITY DEFINER)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN' AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN') AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'TEACHER' AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'STUDENT' AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_parent()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'PARENT' AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if teacher has granular permission
CREATE OR REPLACE FUNCTION public.teacher_has_permission(p_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.teacher_permissions
    WHERE teacher_id = auth.uid()
      AND permission = p_permission
      AND granted = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if teacher is assigned to specific course
CREATE OR REPLACE FUNCTION public.teacher_assigned_to_course(p_course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.teacher_assignments
    WHERE teacher_id = auth.uid()
      AND course_id = p_course_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if authenticated student has ACTIVE, non-expired enrollment in course
CREATE OR REPLACE FUNCTION public.student_has_active_enrollment(p_course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE student_id = auth.uid()
      AND course_id = p_course_id
      AND status = 'ACTIVE'
      AND start_date <= CURRENT_DATE
      AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if parent is legally linked to this student
CREATE OR REPLACE FUNCTION public.parent_has_child(p_student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.parent_students
    WHERE parent_id = auth.uid()
      AND student_id = p_student_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 13. COMPREHENSIVE ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistake_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_level_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- PROFILES POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles read policy" ON public.profiles;
CREATE POLICY "Profiles read policy" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('view_students') AND
      EXISTS (
        SELECT 1 FROM public.enrollments e
        JOIN public.teacher_assignments ta ON ta.course_id = e.course_id
        WHERE e.student_id = profiles.id AND ta.teacher_id = auth.uid()
      )
    ) OR
    (
      public.is_parent() AND
      public.parent_has_child(profiles.id)
    )
  );

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR public.is_admin()
  );

-- -----------------------------------------------------------------------------
-- TEACHERS & PERMISSIONS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Teachers read policy" ON public.teachers;
CREATE POLICY "Teachers read policy" ON public.teachers
  FOR SELECT USING (TRUE); -- Bios & specializations public to users

DROP POLICY IF EXISTS "Teachers manage policy" ON public.teachers;
CREATE POLICY "Teachers manage policy" ON public.teachers
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Teacher permissions read" ON public.teacher_permissions;
CREATE POLICY "Teacher permissions read" ON public.teacher_permissions
  FOR SELECT USING (teacher_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Teacher permissions manage" ON public.teacher_permissions;
CREATE POLICY "Teacher permissions manage" ON public.teacher_permissions
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Teacher assignments read" ON public.teacher_assignments;
CREATE POLICY "Teacher assignments read" ON public.teacher_assignments
  FOR SELECT USING (teacher_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Teacher assignments manage" ON public.teacher_assignments;
CREATE POLICY "Teacher assignments manage" ON public.teacher_assignments
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Teacher invitations manage" ON public.teacher_invitations;
CREATE POLICY "Teacher invitations manage" ON public.teacher_invitations
  FOR ALL USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- STUDENTS & PARENT LINKS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students read policy" ON public.students;
CREATE POLICY "Students read policy" ON public.students
  FOR SELECT USING (
    id = auth.uid() OR
    public.parent_has_child(id) OR
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('view_students') AND
      EXISTS (
        SELECT 1 FROM public.enrollments e
        JOIN public.teacher_assignments ta ON ta.course_id = e.course_id
        WHERE e.student_id = students.id AND ta.teacher_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Students manage policy" ON public.students;
CREATE POLICY "Students manage policy" ON public.students
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Parent students read" ON public.parent_students;
CREATE POLICY "Parent students read" ON public.parent_students
  FOR SELECT USING (
    parent_id = auth.uid() OR
    student_id = auth.uid() OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Parent students manage" ON public.parent_students;
CREATE POLICY "Parent students manage" ON public.parent_students
  FOR ALL USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- ENROLLMENTS POLICIES (Access Control Lifecycle)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Enrollments read policy" ON public.enrollments;
CREATE POLICY "Enrollments read policy" ON public.enrollments
  FOR SELECT USING (
    student_id = auth.uid() OR
    public.parent_has_child(student_id) OR
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_assigned_to_course(course_id)
    )
  );

DROP POLICY IF EXISTS "Enrollments manage policy" ON public.enrollments;
CREATE POLICY "Enrollments manage policy" ON public.enrollments
  FOR ALL USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- COURSES, BATCHES, SUBJECTS, CHAPTERS & TOPICS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Courses read policy" ON public.courses;
CREATE POLICY "Courses read policy" ON public.courses
  FOR SELECT USING (status = 'ACTIVE' OR public.is_admin() OR public.is_teacher());

DROP POLICY IF EXISTS "Courses manage policy" ON public.courses;
CREATE POLICY "Courses manage policy" ON public.courses
  FOR ALL USING (public.is_admin() OR (public.is_teacher() AND public.teacher_has_permission('manage_courses')));

DROP POLICY IF EXISTS "Batches read policy" ON public.batches;
CREATE POLICY "Batches read policy" ON public.batches
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Batches manage policy" ON public.batches;
CREATE POLICY "Batches manage policy" ON public.batches
  FOR ALL USING (public.is_admin() OR (public.is_teacher() AND public.teacher_has_permission('manage_batches')));

DROP POLICY IF EXISTS "Curriculum read policy" ON public.subjects;
CREATE POLICY "Curriculum read policy" ON public.subjects FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Curriculum chapters read" ON public.chapters;
CREATE POLICY "Curriculum chapters read" ON public.chapters FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Curriculum topics read" ON public.topics;
CREATE POLICY "Curriculum topics read" ON public.topics FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Curriculum manage policy" ON public.subjects;
CREATE POLICY "Curriculum manage policy" ON public.subjects FOR ALL USING (public.is_admin() OR (public.is_teacher() AND public.teacher_has_permission('manage_courses')));
DROP POLICY IF EXISTS "Chapters manage policy" ON public.chapters;
CREATE POLICY "Chapters manage policy" ON public.chapters FOR ALL USING (public.is_admin() OR (public.is_teacher() AND public.teacher_has_permission('manage_courses')));
DROP POLICY IF EXISTS "Topics manage policy" ON public.topics;
CREATE POLICY "Topics manage policy" ON public.topics FOR ALL USING (public.is_admin() OR (public.is_teacher() AND public.teacher_has_permission('manage_courses')));

-- -----------------------------------------------------------------------------
-- COURSE CONTENT POLICIES (YouTube & Google Drive Access Control)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Course contents read policy" ON public.course_contents;
CREATE POLICY "Course contents read policy" ON public.course_contents
  FOR SELECT USING (
    (is_free = TRUE AND is_published = TRUE) OR
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_assigned_to_course(course_id)
    ) OR
    (
      public.is_student() AND
      is_published = TRUE AND
      public.student_has_active_enrollment(course_id)
    )
  );

DROP POLICY IF EXISTS "Course contents manage policy" ON public.course_contents;
CREATE POLICY "Course contents manage policy" ON public.course_contents
  FOR ALL USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('add_content') AND
      public.teacher_assigned_to_course(course_id)
    )
  );

-- -----------------------------------------------------------------------------
-- TESTS & ONLINE QUESTIONS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Tests read policy" ON public.tests;
CREATE POLICY "Tests read policy" ON public.tests
  FOR SELECT USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_assigned_to_course(course_id)
    ) OR
    (
      is_published = TRUE AND
      (is_free = TRUE OR public.student_has_active_enrollment(course_id))
    )
  );

DROP POLICY IF EXISTS "Tests manage policy" ON public.tests;
CREATE POLICY "Tests manage policy" ON public.tests
  FOR ALL USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('create_tests') AND
      public.teacher_assigned_to_course(course_id)
    )
  );

DROP POLICY IF EXISTS "Questions read policy" ON public.test_questions;
CREATE POLICY "Questions read policy" ON public.test_questions
  FOR SELECT USING (
    public.is_admin() OR
    public.is_teacher() OR
    EXISTS (
      SELECT 1 FROM public.tests t
      WHERE t.id = test_questions.test_id
        AND t.is_published = TRUE
        AND (t.is_free = TRUE OR public.student_has_active_enrollment(t.course_id))
    )
  );

DROP POLICY IF EXISTS "Questions manage policy" ON public.test_questions;
CREATE POLICY "Questions manage policy" ON public.test_questions
  FOR ALL USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('create_tests')
    )
  );

-- -----------------------------------------------------------------------------
-- TEST ATTEMPTS POLICIES (Student Isolation)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Test attempts read policy" ON public.test_attempts;
CREATE POLICY "Test attempts read policy" ON public.test_attempts
  FOR SELECT USING (
    student_id = auth.uid() OR
    public.parent_has_child(student_id) OR
    public.is_admin() OR
    (
      public.is_teacher() AND
      EXISTS (
        SELECT 1 FROM public.tests t
        JOIN public.teacher_assignments ta ON ta.course_id = t.course_id
        WHERE t.id = test_attempts.test_id AND ta.teacher_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Test attempts insert policy" ON public.test_attempts;
CREATE POLICY "Test attempts insert policy" ON public.test_attempts
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.tests t
      WHERE t.id = test_attempts.test_id
        AND t.is_published = TRUE
        AND (t.is_free = TRUE OR public.student_has_active_enrollment(t.course_id))
    )
  );

-- -----------------------------------------------------------------------------
-- OFFLINE TEST RESULTS & MISTAKE ANALYSIS POLICIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Offline results read policy" ON public.offline_test_results;
CREATE POLICY "Offline results read policy" ON public.offline_test_results
  FOR SELECT USING (
    student_id = auth.uid() OR
    public.parent_has_child(student_id) OR
    public.is_admin() OR
    (
      public.is_teacher() AND
      EXISTS (
        SELECT 1 FROM public.tests t
        JOIN public.teacher_assignments ta ON ta.course_id = t.course_id
        WHERE t.id = offline_test_results.test_id AND ta.teacher_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Offline results insert policy" ON public.offline_test_results;
CREATE POLICY "Offline results insert policy" ON public.offline_test_results
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('enter_offline_results') AND
      EXISTS (
        SELECT 1 FROM public.tests t
        JOIN public.teacher_assignments ta ON ta.course_id = t.course_id
        WHERE t.id = offline_test_results.test_id AND ta.teacher_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Offline results update policy" ON public.offline_test_results;
CREATE POLICY "Offline results update policy" ON public.offline_test_results
  FOR UPDATE USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('edit_offline_results')
    )
  );

DROP POLICY IF EXISTS "Offline results delete policy" ON public.offline_test_results;
CREATE POLICY "Offline results delete policy" ON public.offline_test_results
  FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Mistake categories read" ON public.mistake_categories;
CREATE POLICY "Mistake categories read" ON public.mistake_categories FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Mistake categories manage" ON public.mistake_categories;
CREATE POLICY "Mistake categories manage" ON public.mistake_categories FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Result mistakes read" ON public.result_mistakes;
CREATE POLICY "Result mistakes read" ON public.result_mistakes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.offline_test_results otr
      WHERE otr.id = result_mistakes.result_id
        AND (
          otr.student_id = auth.uid() OR
          public.parent_has_child(otr.student_id) OR
          public.is_admin() OR
          public.is_teacher()
        )
    )
  );

DROP POLICY IF EXISTS "Result mistakes manage" ON public.result_mistakes;
CREATE POLICY "Result mistakes manage" ON public.result_mistakes
  FOR ALL USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('add_mistake_analysis')
    )
  );

DROP POLICY IF EXISTS "Question level results read" ON public.question_level_results;
CREATE POLICY "Question level results read" ON public.question_level_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.offline_test_results otr
      WHERE otr.id = question_level_results.result_id
        AND (
          otr.student_id = auth.uid() OR
          public.parent_has_child(otr.student_id) OR
          public.is_admin() OR
          public.is_teacher()
        )
    )
  );

DROP POLICY IF EXISTS "Question level results manage" ON public.question_level_results;
CREATE POLICY "Question level results manage" ON public.question_level_results
  FOR ALL USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('add_mistake_analysis')
    )
  );

-- -----------------------------------------------------------------------------
-- HOMEWORK & SUBMISSIONS (Student Isolation)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Homework read policy" ON public.homework;
CREATE POLICY "Homework read policy" ON public.homework
  FOR SELECT USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_assigned_to_course(course_id)
    ) OR
    public.student_has_active_enrollment(course_id)
  );

DROP POLICY IF EXISTS "Homework manage policy" ON public.homework;
CREATE POLICY "Homework manage policy" ON public.homework
  FOR ALL USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('create_homework') AND
      public.teacher_assigned_to_course(course_id)
    )
  );

DROP POLICY IF EXISTS "Submissions read policy" ON public.homework_submissions;
CREATE POLICY "Submissions read policy" ON public.homework_submissions
  FOR SELECT USING (
    student_id = auth.uid() OR
    public.parent_has_child(student_id) OR
    public.is_admin() OR
    (
      public.is_teacher() AND
      EXISTS (
        SELECT 1 FROM public.homework h
        JOIN public.teacher_assignments ta ON ta.course_id = h.course_id
        WHERE h.id = homework_submissions.homework_id AND ta.teacher_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Submissions insert/update student" ON public.homework_submissions;
CREATE POLICY "Submissions insert/update student" ON public.homework_submissions
  FOR ALL USING (
    student_id = auth.uid() OR
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('evaluate_homework')
    )
  );

-- -----------------------------------------------------------------------------
-- ATTENDANCE REGISTER (Student & Parent Isolation)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Attendance read policy" ON public.attendance;
CREATE POLICY "Attendance read policy" ON public.attendance
  FOR SELECT USING (
    student_id = auth.uid() OR
    public.parent_has_child(student_id) OR
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_assigned_to_course(course_id)
    )
  );

DROP POLICY IF EXISTS "Attendance manage policy" ON public.attendance;
CREATE POLICY "Attendance manage policy" ON public.attendance
  FOR ALL USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('mark_attendance') AND
      public.teacher_assigned_to_course(course_id)
    )
  );

-- -----------------------------------------------------------------------------
-- DOUBTS DESK
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Doubts read policy" ON public.doubts;
CREATE POLICY "Doubts read policy" ON public.doubts
  FOR SELECT USING (
    student_id = auth.uid() OR
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_assigned_to_course(course_id)
    )
  );

DROP POLICY IF EXISTS "Doubts insert student" ON public.doubts;
CREATE POLICY "Doubts insert student" ON public.doubts
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND
    public.student_has_active_enrollment(course_id)
  );

DROP POLICY IF EXISTS "Doubts answer policy" ON public.doubts;
CREATE POLICY "Doubts answer policy" ON public.doubts
  FOR UPDATE USING (
    student_id = auth.uid() OR
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('answer_doubts') AND
      public.teacher_assigned_to_course(course_id)
    )
  );

-- -----------------------------------------------------------------------------
-- FEES & PAYMENTS LEDGER (Confidential Financial Data)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Fees read policy" ON public.fees;
CREATE POLICY "Fees read policy" ON public.fees
  FOR SELECT USING (
    student_id = auth.uid() OR
    public.parent_has_child(student_id) OR
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('view_fees')
    )
  );

DROP POLICY IF EXISTS "Fees manage policy" ON public.fees;
CREATE POLICY "Fees manage policy" ON public.fees
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Payments read policy" ON public.fee_payments;
CREATE POLICY "Payments read policy" ON public.fee_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.fees f
      WHERE f.id = fee_payments.fee_id
        AND (
          f.student_id = auth.uid() OR
          public.parent_has_child(f.student_id) OR
          public.is_admin() OR
          (public.is_teacher() AND public.teacher_has_permission('view_fees'))
        )
    )
  );

DROP POLICY IF EXISTS "Payments insert policy" ON public.fee_payments;
CREATE POLICY "Payments insert policy" ON public.fee_payments
  FOR INSERT WITH CHECK (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('add_fee_payment')
    )
  );

-- -----------------------------------------------------------------------------
-- AI ANALYSES & PROGRESS REPORTS
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "AI analyses read policy" ON public.ai_analyses;
CREATE POLICY "AI analyses read policy" ON public.ai_analyses
  FOR SELECT USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      (course_id IS NULL OR public.teacher_assigned_to_course(course_id))
    ) OR
    (is_shared_with_student = TRUE AND student_id = auth.uid()) OR
    (is_shared_with_parent = TRUE AND public.parent_has_child(student_id))
  );

DROP POLICY IF EXISTS "AI analyses manage policy" ON public.ai_analyses;
CREATE POLICY "AI analyses manage policy" ON public.ai_analyses
  FOR ALL USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('generate_ai_analysis')
    )
  );

DROP POLICY IF EXISTS "Progress reports read policy" ON public.progress_reports;
CREATE POLICY "Progress reports read policy" ON public.progress_reports
  FOR SELECT USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_assigned_to_course(course_id)
    ) OR
    (is_shared_student = TRUE AND student_id = auth.uid()) OR
    (is_shared_parent = TRUE AND public.parent_has_child(student_id))
  );

DROP POLICY IF EXISTS "Progress reports manage policy" ON public.progress_reports;
CREATE POLICY "Progress reports manage policy" ON public.progress_reports
  FOR ALL USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('share_reports')
    )
  );

-- -----------------------------------------------------------------------------
-- NOTIFICATIONS, ANNOUNCEMENTS, LOGS & ENQUIRIES
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Notifications isolation policy" ON public.notifications;
CREATE POLICY "Notifications isolation policy" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Announcements read policy" ON public.announcements;
CREATE POLICY "Announcements read policy" ON public.announcements
  FOR SELECT USING (
    expiry_date IS NULL OR expiry_date >= NOW()
  );

DROP POLICY IF EXISTS "Announcements manage policy" ON public.announcements;
CREATE POLICY "Announcements manage policy" ON public.announcements
  FOR ALL USING (
    public.is_admin() OR
    (
      public.is_teacher() AND
      public.teacher_has_permission('send_notifications')
    )
  );

DROP POLICY IF EXISTS "Activity logs view" ON public.activity_logs;
CREATE POLICY "Activity logs view" ON public.activity_logs
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Enquiries public insert" ON public.enquiries;
CREATE POLICY "Enquiries public insert" ON public.enquiries
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Enquiries admin manage" ON public.enquiries;
CREATE POLICY "Enquiries admin manage" ON public.enquiries
  FOR ALL USING (public.is_admin());

-- =============================================================================
-- 14. INITIAL SEED: MISTAKE CATEGORIES
-- =============================================================================
INSERT INTO public.mistake_categories (name, description, order_index) VALUES
('Concept Mistake', 'Fundamental misunderstanding of core theorem, theory or definition', 1),
('Calculation Mistake', 'Computational arithmetic or simplification error', 2),
('Sign Mistake', 'Dropped or inverted positive/negative sign during algebraic operations', 3),
('Formula Mistake', 'Incorrect formula recalled or applied inappropriately', 4),
('Arithmetic Mistake', 'Elementary addition, subtraction, division or multiplication error', 5),
('Logical/Reasoning Mistake', 'Flawed deductive step or incorrect assumption in multi-step proof', 6),
('Question Misunderstood', 'Misinterpreted question requirements or constraints', 7),
('Reading Mistake', 'Overlooked given numbers, conditions or units in question statement', 8),
('Careless/Silly Mistake', 'Rushed step, transcript error, or misplaced step in scratch work', 9),
('Time Management Mistake', 'Ran out of time leading to hurried or incomplete response', 10),
('Diagram Mistake', 'Incorrect geometric construction, ray diagram, or graph labelling', 11),
('Presentation Mistake', 'Steps omitted, illegible handwriting, or missing final units', 12),
('Unattempted', 'Question left blank due to lack of confidence or knowledge', 13),
('Lack of Practice', 'Knew concept generally but struggled with problem-solving execution', 14),
('Other', 'Uncategorized or unique mistake', 15)
ON CONFLICT (name) DO NOTHING;
