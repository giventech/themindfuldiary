-- Create referral_codes table
CREATE TABLE public.referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT REFERENCES public.referral_codes(code),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referrer_id, referred_id)
);

-- Create reward_tiers table
CREATE TABLE public.reward_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  min_referrals INTEGER NOT NULL,
  rewards JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_rewards table
CREATE TABLE public.user_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_tier TEXT,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default reward tiers
INSERT INTO public.reward_tiers (name, min_referrals, rewards) VALUES
('Dream Starter', 0, '["Welcome bonus", "Basic insights"]'),
('Dream Advocate', 3, '["Premium themes", "Advanced analytics", "Priority support"]'),
('Wisdom Guide', 10, '["AI coaching", "Custom insights", "Beta features"]'),
('Enlightened Mentor', 25, '["Lifetime premium", "Exclusive community", "Co-creation opportunities"]');

-- Enable Row Level Security
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for referral_codes
CREATE POLICY "Users can view own referral codes" ON public.referral_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral codes" ON public.referral_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral codes" ON public.referral_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for referrals
CREATE POLICY "Users can view referrals they made or received" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referred_id);

CREATE POLICY "Users can update referrals they made" ON public.referrals
  FOR UPDATE USING (auth.uid() = referrer_id);

-- Create policies for reward_tiers (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view reward tiers" ON public.reward_tiers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policies for user_rewards
CREATE POLICY "Users can view own rewards" ON public.user_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rewards" ON public.user_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards" ON public.user_rewards
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_user_rewards_user_id ON public.user_rewards(user_id);

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_name TEXT)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    code := 'DREAM' || UPPER(SUBSTRING(user_name FROM 1 FOR 3)) || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    SELECT COUNT(*) INTO exists_check 
    FROM public.referral_codes 
    WHERE referral_codes.code = code;
    
    EXIT WHEN exists_check = 0;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle referral signup
CREATE OR REPLACE FUNCTION handle_referral_signup()
RETURNS TRIGGER AS $$
DECLARE
  referrer_user_id UUID;
  reward_points INTEGER := 30;
BEGIN
  -- Check if user signed up with a referral code
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    -- Find the referrer
    SELECT user_id INTO referrer_user_id
    FROM public.referral_codes
    WHERE code = NEW.raw_user_meta_data->>'referral_code'
    AND is_active = TRUE;
    
    IF referrer_user_id IS NOT NULL THEN
      -- Create referral record
      INSERT INTO public.referrals (referrer_id, referred_id, referral_code, status, reward_points)
      VALUES (referrer_user_id, NEW.id, NEW.raw_user_meta_data->>'referral_code', 'active', reward_points);
      
      -- Update referrer's rewards
      INSERT INTO public.user_rewards (user_id, total_points, total_referrals, successful_referrals)
      VALUES (referrer_user_id, reward_points, 1, 1)
      ON CONFLICT (user_id) DO UPDATE SET
        total_points = user_rewards.total_points + reward_points,
        total_referrals = user_rewards.total_referrals + 1,
        successful_referrals = user_rewards.successful_referrals + 1,
        updated_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral signup
CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_referral_signup();


-- Create users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT,
  dream_frequency TEXT,
  journal_experience TEXT,
  goals TEXT[],
  notification_time INTEGER,
  privacy_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dreams table
CREATE TABLE public.dreams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  emotions TEXT[],
  vividness INTEGER CHECK (vividness >= 1 AND vividness <= 10),
  lucidity INTEGER CHECK (lucidity >= 1 AND lucidity <= 10),
  themes TEXT[],
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create situation_analyses table
CREATE TABLE public.situation_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  situation TEXT NOT NULL,
  emotions TEXT[],
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  location TEXT,
  weather TEXT,
  people_involved TEXT,
  triggers TEXT,
  responses TEXT,
  learnings TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gratitude_entries table
CREATE TABLE public.gratitude_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gratitudes TEXT[] NOT NULL,
  reflection TEXT,
  actions TEXT[],
  manifestation TEXT,
  photo_url TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create self_soothing_sessions table
CREATE TABLE public.self_soothing_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  technique_id TEXT NOT NULL,
  technique_name TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.situation_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratitude_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_soothing_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own dreams" ON public.dreams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dreams" ON public.dreams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dreams" ON public.dreams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dreams" ON public.dreams
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables
CREATE POLICY "Users can manage own situation analyses" ON public.situation_analyses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own gratitude entries" ON public.gratitude_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own soothing sessions" ON public.self_soothing_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_dreams_user_id_date ON public.dreams(user_id, date DESC);
CREATE INDEX idx_situation_analyses_user_id_date ON public.situation_analyses(user_id, date DESC);
CREATE INDEX idx_gratitude_entries_user_id_date ON public.gratitude_entries(user_id, date DESC);
CREATE INDEX idx_self_soothing_sessions_user_id_created ON public.self_soothing_sessions(user_id, created_at DESC);
-- Drop the existing function first
DROP FUNCTION IF EXISTS create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT[], INTEGER, TEXT);

-- Create a function to handle profile creation after signup with fixed parameter names
CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id UUID,
  p_user_name TEXT,
  p_user_email TEXT,
  p_dream_freq TEXT,
  p_journal_exp TEXT,
  p_user_goals TEXT[],
  p_notif_time INTEGER,
  p_privacy_lvl TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Insert user profile
  INSERT INTO public.user_profiles (
    id,
    name,
    email,
    dream_frequency,
    journal_experience,
    goals,
    notification_time,
    privacy_level
  ) VALUES (
    p_user_id,
    p_user_name,
    p_user_email,
    p_dream_freq,
    p_journal_exp,
    p_user_goals,
    p_notif_time,
    p_privacy_lvl
  );
  
  -- Initialize user rewards if they don't exist
  INSERT INTO public.user_rewards (
    user_id,
    total_points,
    current_tier,
    total_referrals,
    successful_referrals
  ) VALUES (
    p_user_id,
    0,
    'Dream Starter',
    0,
    0
  ) ON CONFLICT (user_id) DO NOTHING;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the entire operation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT[], INTEGER, TEXT) TO authenticated;

-- Also create a simpler function for ensuring profiles exist
CREATE OR REPLACE FUNCTION ensure_user_profile(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  profile_exists BOOLEAN;
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles WHERE id = p_user_id
  ) INTO profile_exists;
  
  -- If profile doesn't exist, create it with defaults
  IF NOT profile_exists THEN
    -- Try to get user info from auth.users
    SELECT 
      COALESCE(raw_user_meta_data->>'name', email),
      email
    INTO user_name, user_email
    FROM auth.users 
    WHERE id = p_user_id;
    
    -- Create profile with defaults
    INSERT INTO public.user_profiles (
      id,
      name,
      email,
      dream_frequency,
      journal_experience,
      goals,
      notification_time,
      privacy_level
    ) VALUES (
      p_user_id,
      COALESCE(user_name, 'User'),
      COALESCE(user_email, ''),
      'sometimes',
      'beginner',
      ARRAY['Better understand my dreams'],
      21,
      'high'
    );
    
    -- Initialize user rewards
    INSERT INTO public.user_rewards (
      user_id,
      total_points,
      current_tier,
      total_referrals,
      successful_referrals
    ) VALUES (
      p_user_id,
      0,
      'Dream Starter',
      0,
      0
    ) ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error ensuring user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION ensure_user_profile(UUID) TO authenticated;
-- Drop existing functions
DROP FUNCTION IF EXISTS create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT[], INTEGER, TEXT);
DROP FUNCTION IF EXISTS ensure_user_profile(UUID);

-- Create a simpler function that uses JSONB for parameters to avoid ordering issues
CREATE OR REPLACE FUNCTION create_user_profile_json(profile_data JSONB)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{"success": false, "message": "Unknown error"}';
  user_id_param UUID;
BEGIN
  -- Extract user_id from the JSON
  user_id_param := (profile_data->>'user_id')::UUID;
  
  -- Validate required fields
  IF user_id_param IS NULL THEN
    RETURN '{"success": false, "message": "user_id is required"}';
  END IF;
  
  -- Insert user profile
  INSERT INTO public.user_profiles (
    id,
    name,
    email,
    dream_frequency,
    journal_experience,
    goals,
    notification_time,
    privacy_level
  ) VALUES (
    user_id_param,
    COALESCE(profile_data->>'name', 'User'),
    COALESCE(profile_data->>'email', ''),
    COALESCE(profile_data->>'dream_frequency', 'sometimes'),
    COALESCE(profile_data->>'journal_experience', 'beginner'),
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(profile_data->'goals')),
      ARRAY['Better understand my dreams']
    ),
    COALESCE((profile_data->>'notification_time')::INTEGER, 21),
    COALESCE(profile_data->>'privacy_level', 'high')
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    dream_frequency = EXCLUDED.dream_frequency,
    journal_experience = EXCLUDED.journal_experience,
    goals = EXCLUDED.goals,
    notification_time = EXCLUDED.notification_time,
    privacy_level = EXCLUDED.privacy_level,
    updated_at = NOW();
  
  -- Initialize user rewards if they don't exist
  INSERT INTO public.user_rewards (
    user_id,
    total_points,
    current_tier,
    total_referrals,
    successful_referrals
  ) VALUES (
    user_id_param,
    0,
    'Dream Starter',
    0,
    0
  ) ON CONFLICT (user_id) DO NOTHING;
  
  result := '{"success": true, "message": "Profile created successfully"}';
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    result := jsonb_build_object(
      'success', false,
      'message', 'Error creating profile: ' || SQLERRM
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile_json(JSONB) TO authenticated;

-- Create a simple function to ensure profile exists
CREATE OR REPLACE FUNCTION ensure_user_profile_simple(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{"success": false, "message": "Unknown error"}';
  profile_exists BOOLEAN;
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles WHERE id = user_id_param
  ) INTO profile_exists;
  
  -- If profile doesn't exist, create it with defaults
  IF NOT profile_exists THEN
    -- Try to get user info from auth.users
    SELECT 
      COALESCE(raw_user_meta_data->>'name', email),
      email
    INTO user_name, user_email
    FROM auth.users 
    WHERE id = user_id_param;
    
    -- Create profile with defaults
    INSERT INTO public.user_profiles (
      id,
      name,
      email,
      dream_frequency,
      journal_experience,
      goals,
      notification_time,
      privacy_level
    ) VALUES (
      user_id_param,
      COALESCE(user_name, 'User'),
      COALESCE(user_email, ''),
      'sometimes',
      'beginner',
      ARRAY['Better understand my dreams'],
      21,
      'high'
    );
    
    -- Initialize user rewards
    INSERT INTO public.user_rewards (
      user_id,
      total_points,
      current_tier,
      total_referrals,
      successful_referrals
    ) VALUES (
      user_id_param,
      0,
      'Dream Starter',
      0,
      0
    ) ON CONFLICT (user_id) DO NOTHING;
    
    result := '{"success": true, "message": "Profile created with defaults"}';
  ELSE
    result := '{"success": true, "message": "Profile already exists"}';
  END IF;
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    result := jsonb_build_object(
      'success', false,
      'message', 'Error ensuring profile: ' || SQLERRM
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION ensure_user_profile_simple(UUID) TO authenticated;

-- Create a function to get user profile with fallback creation
CREATE OR REPLACE FUNCTION get_or_create_user_profile(user_id_param UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  dream_frequency TEXT,
  journal_experience TEXT,
  goals TEXT[],
  notification_time INTEGER,
  privacy_level TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- First try to get existing profile
  RETURN QUERY
  SELECT 
    up.id,
    up.name,
    up.email,
    up.dream_frequency,
    up.journal_experience,
    up.goals,
    up.notification_time,
    up.privacy_level,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  WHERE up.id = user_id_param;
  
  -- If no profile found, create one and return it
  IF NOT FOUND THEN
    -- Call ensure function to create profile
    PERFORM ensure_user_profile_simple(user_id_param);
    
    -- Return the newly created profile
    RETURN QUERY
    SELECT 
      up.id,
      up.name,
      up.email,
      up.dream_frequency,
      up.journal_experience,
      up.goals,
      up.notification_time,
      up.privacy_level,
      up.created_at,
      up.updated_at
    FROM public.user_profiles up
    WHERE up.id = user_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_or_create_user_profile(UUID) TO authenticated;
-- Drop existing policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Create more permissive policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role to manage profiles (for server-side operations)
CREATE POLICY "Service role can manage profiles" ON public.user_profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Also update the user_rewards policies to be more permissive
DROP POLICY IF EXISTS "Users can view own rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Users can insert own rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Users can update own rewards" ON public.user_rewards;

CREATE POLICY "Users can view own rewards" ON public.user_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rewards" ON public.user_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards" ON public.user_rewards
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to manage rewards
CREATE POLICY "Service role can manage rewards" ON public.user_rewards
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create a function to handle profile creation after signup
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  dream_freq TEXT,
  journal_exp TEXT,
  user_goals TEXT[],
  notif_time INTEGER,
  privacy_lvl TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Insert user profile
  INSERT INTO public.user_profiles (
    id,
    name,
    email,
    dream_frequency,
    journal_experience,
    goals,
    notification_time,
    privacy_level
  ) VALUES (
    user_id,
    user_name,
    user_email,
    dream_freq,
    journal_exp,
    user_goals,
    notif_time,
    privacy_lvl
  );
  
  -- Initialize user rewards if they don't exist
  INSERT INTO public.user_rewards (
    user_id,
    total_points,
    current_tier,
    total_referrals,
    successful_referrals
  ) VALUES (
    user_id,
    0,
    'Dream Starter',
    0,
    0
  ) ON CONFLICT (user_id) DO NOTHING;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT[], INTEGER, TEXT) TO authenticated;
-- Update the referral signup handler to be more robust
CREATE OR REPLACE FUNCTION handle_referral_signup()
RETURNS TRIGGER AS $$
DECLARE
  referrer_user_id UUID;
  reward_points INTEGER := 30;
  referral_code_text TEXT;
BEGIN
  -- Get referral code from user metadata
  referral_code_text := NEW.raw_user_meta_data->>'referral_code';
  
  -- Check if user signed up with a referral code
  IF referral_code_text IS NOT NULL AND referral_code_text != '' THEN
    -- Find the referrer
    SELECT user_id INTO referrer_user_id
    FROM public.referral_codes
    WHERE code = UPPER(referral_code_text)
    AND is_active = TRUE;
    
    IF referrer_user_id IS NOT NULL THEN
      -- Create referral record
      INSERT INTO public.referrals (referrer_id, referred_id, referral_code, status, reward_points)
      VALUES (referrer_user_id, NEW.id, UPPER(referral_code_text), 'active', reward_points)
      ON CONFLICT (referrer_id, referred_id) DO NOTHING;
      
      -- Update referrer's rewards
      INSERT INTO public.user_rewards (user_id, total_points, total_referrals, successful_referrals)
      VALUES (referrer_user_id, reward_points, 1, 1)
      ON CONFLICT (user_id) DO UPDATE SET
        total_points = user_rewards.total_points + reward_points,
        total_referrals = user_rewards.total_referrals + 1,
        successful_referrals = user_rewards.successful_referrals + 1,
        updated_at = NOW();
        
      -- Log the successful referral
      INSERT INTO public.referral_logs (referrer_id, referred_id, action, details)
      VALUES (referrer_user_id, NEW.id, 'signup_completed', 
              jsonb_build_object('referral_code', UPPER(referral_code_text), 'reward_points', reward_points));
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    INSERT INTO public.referral_logs (referred_id, action, details)
    VALUES (NEW.id, 'signup_error', 
            jsonb_build_object('error', SQLERRM, 'referral_code', referral_code_text));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create referral logs table for debugging and analytics
CREATE TABLE IF NOT EXISTS public.referral_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for referral logs
ALTER TABLE public.referral_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for referral logs (admin only for now)
CREATE POLICY "Service role can manage referral logs" ON public.referral_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_referral_logs_created_at ON public.referral_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_logs_action ON public.referral_logs(action);

-- Function to get referral code validation info (safe for client use)
CREATE OR REPLACE FUNCTION validate_referral_code_public(code_input TEXT)
RETURNS TABLE(is_valid BOOLEAN, referrer_name TEXT, message TEXT) AS $$
DECLARE
  referrer_record RECORD;
BEGIN
  -- Check if code exists and is active
  SELECT rc.user_id, up.name
  INTO referrer_record
  FROM public.referral_codes rc
  LEFT JOIN public.user_profiles up ON rc.user_id = up.id
  WHERE rc.code = UPPER(code_input)
  AND rc.is_active = TRUE;
  
  IF referrer_record.user_id IS NOT NULL THEN
    RETURN QUERY SELECT 
      TRUE as is_valid,
      COALESCE(referrer_record.name, 'A friend') as referrer_name,
      'Valid referral code! You''ll both receive special benefits.' as message;
  ELSE
    RETURN QUERY SELECT 
      FALSE as is_valid,
      ''::TEXT as referrer_name,
      'This referral code doesn''t exist or is no longer active.' as message;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION validate_referral_code_public(TEXT) TO authenticated;
