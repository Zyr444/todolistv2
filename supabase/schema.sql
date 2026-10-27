-- =========================================================================
-- FlowDo Database Schema & Row Level Security (RLS) Setup for Supabase
-- Run this script in the Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- =========================================================================

-- =========================================================================
-- QUICK MIGRATION (If you already created the tables previously):
-- =========================================================================
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low'));

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS subtasks JSONB NOT NULL DEFAULT '[]'::jsonb;

-- =========================================================================
-- FULL TABLE DEFINITIONS (For new setups):
-- =========================================================================

-- 1. Create TASKS table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    completed_date DATE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create SCHEDULES table for recurring automated tasks
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    -- Days of week: array of integers where 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    days_of_week INTEGER[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_date ON public.tasks(completed_date);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON public.schedules(user_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for TASKS
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
CREATE POLICY "Users can insert their own tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);

-- 6. RLS Policies for SCHEDULES
DROP POLICY IF EXISTS "Users can view their own schedules" ON public.schedules;
CREATE POLICY "Users can view their own schedules"
    ON public.schedules FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own schedules" ON public.schedules;
CREATE POLICY "Users can insert their own schedules"
    ON public.schedules FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own schedules" ON public.schedules;
CREATE POLICY "Users can update their own schedules"
    ON public.schedules FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own schedules" ON public.schedules;
CREATE POLICY "Users can delete their own schedules"
    ON public.schedules FOR DELETE
    USING (auth.uid() = user_id);
