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
