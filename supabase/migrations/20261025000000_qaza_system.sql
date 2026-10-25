-- ==============================================================================
-- TAWFIQ QAZA SYSTEM: RELATIONAL SCHEMA, AUDIT TRAIL, AND ROW LEVEL SECURITY
-- Migration: 20261025000000_qaza_system.sql
-- ==============================================================================

-- 1. Fiqh Configuration Registry (Versioned Jurisprudence Reference)
CREATE TABLE IF NOT EXISTS fiqh_configurations (
    id VARCHAR(64) PRIMARY KEY,
    madhhab VARCHAR(32) NOT NULL,
    version VARCHAR(16) NOT NULL,
    title VARCHAR(128) NOT NULL,
    review_status VARCHAR(32) NOT NULL CHECK (review_status IN ('reviewed_and_approved', 'pending_scholarly_review', 'draft', 'deprecated')),
    reviewer_attribution VARCHAR(256),
    review_timestamp TIMESTAMPTZ,
    rule_definitions JSONB NOT NULL DEFAULT '{}'::jsonb,
    supported_prayer_categories TEXT[] NOT NULL DEFAULT ARRAY['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'],
    witr_behavior VARCHAR(32) NOT NULL DEFAULT 'sunnah_muakkadah',
    sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. User Qaza Profiles
CREATE TABLE IF NOT EXISTS qaza_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    selected_madhhab VARCHAR(32) NOT NULL DEFAULT 'hanafi',
    fiqh_configuration_id VARCHAR(64) REFERENCES fiqh_configurations(id),
    accountability_start_date DATE,
    accountability_start_precision VARCHAR(32) NOT NULL DEFAULT 'approximate_age' CHECK (accountability_start_precision IN ('exact_date', 'approximate_date', 'approximate_age', 'user_defined')),
    historical_end_date DATE,
    historical_end_precision VARCHAR(32) NOT NULL DEFAULT 'exact_date',
    track_witr BOOLEAN NOT NULL DEFAULT false,
    rounding_policy VARCHAR(32) NOT NULL DEFAULT 'upward' CHECK (rounding_policy IN ('upward', 'nearest', 'custom')),
    timezone VARCHAR(64) DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_qaza_profiles_user UNIQUE (user_id)
);

-- 3. Prayer History Segments (Timeline Model)
CREATE TABLE IF NOT EXISTS prayer_history_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES qaza_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    date_precision VARCHAR(32) NOT NULL DEFAULT 'exact',
    segment_label VARCHAR(128) NOT NULL,
    historical_pattern_type VARCHAR(64) NOT NULL,
    confidence_level VARCHAR(32) NOT NULL DEFAULT 'medium',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_segment_dates CHECK (end_date >= start_date)
);

-- 4. Prayer Miss Estimates (Per-Prayer Category Estimation Configuration)
CREATE TABLE IF NOT EXISTS prayer_miss_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id UUID NOT NULL REFERENCES prayer_history_segments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    prayer_category VARCHAR(16) NOT NULL CHECK (prayer_category IN ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'witr')),
    estimation_method VARCHAR(32) NOT NULL CHECK (estimation_method IN ('exact', 'average_weekly', 'uncertain_range', 'every_day', 'custom_target')),
    exact_missed_count INTEGER DEFAULT 0 CHECK (exact_missed_count >= 0),
    average_missed_frequency NUMERIC(4, 2) DEFAULT 0 CHECK (average_missed_frequency >= 0 AND average_missed_frequency <= 7),
    lower_frequency NUMERIC(4, 2) DEFAULT 0 CHECK (lower_frequency >= 0 AND lower_frequency <= 7),
    upper_frequency NUMERIC(4, 2) DEFAULT 0 CHECK (upper_frequency >= 0 AND upper_frequency <= 7),
    custom_target INTEGER DEFAULT 0 CHECK (custom_target >= 0),
    input_provenance VARCHAR(64) DEFAULT 'user_entered',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_segment_prayer UNIQUE (segment_id, prayer_category)
);

-- 5. Excluded Periods & Circumstances (Menses, Postnatal, Illness, Conversion)
CREATE TABLE IF NOT EXISTS excluded_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES qaza_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    start_date DATE,
    end_date DATE,
    aggregate_excluded_days INTEGER DEFAULT 0 CHECK (aggregate_excluded_days >= 0),
    exclusion_category VARCHAR(64) NOT NULL CHECK (exclusion_category IN ('menses', 'postnatal', 'illness', 'unconscious', 'conversion_pre', 'custom')),
    fiqh_configuration_id VARCHAR(64) REFERENCES fiqh_configurations(id),
    review_status VARCHAR(32) NOT NULL DEFAULT 'reviewed_and_approved',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Versioned Qaza Estimate Snapshots (Immutable Audit Versions)
CREATE TABLE IF NOT EXISTS qaza_estimate_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES qaza_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    calculation_algorithm_version VARCHAR(32) NOT NULL DEFAULT '2.0.0',
    fiqh_configuration_id VARCHAR(64) REFERENCES fiqh_configurations(id),
    original_inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
    per_prayer_totals JSONB NOT NULL DEFAULT '{}'::jsonb,
    lower_bounds JSONB NOT NULL DEFAULT '{}'::jsonb,
    upper_bounds JSONB NOT NULL DEFAULT '{}'::jsonb,
    selected_targets JSONB NOT NULL DEFAULT '{}'::jsonb,
    rounding_policy VARCHAR(32) NOT NULL DEFAULT 'upward',
    assumptions_and_warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_profile_estimate_version UNIQUE (profile_id, version_number)
);

-- 7. Qaza Completion Ledger (Append-Only Event Store with Reversals)
CREATE TABLE IF NOT EXISTS qaza_completion_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    prayer_category VARCHAR(16) NOT NULL CHECK (prayer_category IN ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'witr')),
    completed_count INTEGER NOT NULL DEFAULT 1 CHECK (completed_count > 0),
    completion_date DATE NOT NULL,
    completion_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    entry_source VARCHAR(64) NOT NULL DEFAULT 'qaza_screen',
    batch_id VARCHAR(64),
    idempotency_key VARCHAR(128),
    is_reversed BOOLEAN NOT NULL DEFAULT false,
    reversed_at TIMESTAMPTZ,
    reversed_entry_id UUID REFERENCES qaza_completion_entries(id),
    reversal_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_completion_idempotency UNIQUE (user_id, idempotency_key)
);

-- 8. Repayment Plans
CREATE TABLE IF NOT EXISTS qaza_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    daily_target INTEGER NOT NULL DEFAULT 5 CHECK (daily_target > 0),
    category_targets JSONB DEFAULT '{}'::jsonb,
    weekly_goal INTEGER DEFAULT 35 CHECK (weekly_goal > 0),
    reminder_settings JSONB DEFAULT '{"enabled": false, "time": "20:00"}'::jsonb,
    start_date DATE NOT NULL,
    is_paused BOOLEAN NOT NULL DEFAULT false,
    completion_projections JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_qaza_plans_user UNIQUE (user_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE qaza_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_history_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_miss_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE excluded_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE qaza_estimate_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qaza_completion_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE qaza_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiqh_configurations ENABLE ROW LEVEL SECURITY;

-- Public read for fiqh configurations
CREATE POLICY "Public read for fiqh configurations" 
    ON fiqh_configurations FOR SELECT 
    USING (true);

-- User-scoped policies
CREATE POLICY "Users access own qaza profile" 
    ON qaza_profiles FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own prayer history segments" 
    ON prayer_history_segments FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own prayer miss estimates" 
    ON prayer_miss_estimates FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own excluded periods" 
    ON excluded_periods FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own estimate versions" 
    ON qaza_estimate_versions FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own completions" 
    ON qaza_completion_entries FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own repayment plans" 
    ON qaza_plans FOR ALL 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_segments_user_dates ON prayer_history_segments(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_completions_user_date ON qaza_completion_entries(user_id, completion_date);
CREATE INDEX IF NOT EXISTS idx_completions_user_prayer ON qaza_completion_entries(user_id, prayer_category);
