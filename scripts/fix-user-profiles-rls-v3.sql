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
