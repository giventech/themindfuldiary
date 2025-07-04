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
