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
