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
