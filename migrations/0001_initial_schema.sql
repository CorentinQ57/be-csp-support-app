-- Enable Row Level Security (RLS)
-- Supabase Auth already manages users, we need a profiles table for additional info

-- Profiles Table (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  organization TEXT,
  role TEXT DEFAULT 'user', -- e.g., 'user', 'admin', 'agent'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, organization, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name', 
    NEW.raw_user_meta_data ->> 'organization',
    'user' -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
-- Users can view their own profile
CREATE POLICY "Users can view their own profile." ON profiles
  FOR SELECT USING (auth.uid() = id);
-- Users can update their own profile
CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
-- Admins can view and manage all profiles (adjust role name if needed)
CREATE POLICY "Admins can manage all profiles." ON profiles
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- Tickets Table
CREATE TABLE tickets (
  id BIGSERIAL PRIMARY KEY,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Ouvert', -- e.g., 'Ouvert', 'En cours', 'En attente', 'Résolu', 'Fermé'
  priority TEXT DEFAULT 'Moyenne', -- e.g., 'Basse', 'Moyenne', 'Haute', 'Urgente'
  category TEXT, -- e.g., 'Microsoft 365', 'Azure', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS for tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policies for tickets
-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets." ON tickets
  FOR SELECT USING (auth.uid() = created_by_user_id);
-- Users can create tickets
CREATE POLICY "Users can create tickets." ON tickets
  FOR INSERT WITH CHECK (auth.uid() = created_by_user_id);
-- Agents/Admins can view all tickets
CREATE POLICY "Agents/Admins can view all tickets." ON tickets
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'agent')));
-- Agents/Admins can update tickets (status, assignment, etc.)
CREATE POLICY "Agents/Admins can update tickets." ON tickets
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'agent')));


-- Ticket Messages Table
CREATE TABLE ticket_messages (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for ticket_messages
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Policies for ticket_messages
-- Users can view messages for their own tickets
CREATE POLICY "Users can view messages for their own tickets." ON ticket_messages
  FOR SELECT USING (EXISTS (SELECT 1 FROM tickets WHERE id = ticket_id AND created_by_user_id = auth.uid()));
-- Users can add messages to their own tickets
CREATE POLICY "Users can add messages to their own tickets." ON ticket_messages
  FOR INSERT WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM tickets WHERE id = ticket_id AND created_by_user_id = auth.uid()));
-- Agents/Admins can view all messages
CREATE POLICY "Agents/Admins can view all messages." ON ticket_messages
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'agent')));
-- Agents/Admins can add messages to any ticket
CREATE POLICY "Agents/Admins can add messages to any ticket." ON ticket_messages
  FOR INSERT WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'agent')));


-- Ticket Attachments Table (using Supabase Storage)
-- We store metadata here, files are in Storage
CREATE TABLE ticket_attachments (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT REFERENCES ticket_messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage bucket
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS for ticket_attachments
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Policies for ticket_attachments
-- Users can view attachments for messages on their own tickets
CREATE POLICY "Users can view attachments for their own tickets." ON ticket_attachments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM ticket_messages tm JOIN tickets t ON tm.ticket_id = t.id 
    WHERE tm.id = message_id AND t.created_by_user_id = auth.uid()
  ));
-- Users can insert attachments for messages they are creating on their own tickets
CREATE POLICY "Users can insert attachments for their messages." ON ticket_attachments
  FOR INSERT WITH CHECK (uploaded_by_user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM ticket_messages tm JOIN tickets t ON tm.ticket_id = t.id 
    WHERE tm.id = message_id AND t.created_by_user_id = auth.uid()
  ));
-- Agents/Admins can view all attachments
CREATE POLICY "Agents/Admins can view all attachments." ON ticket_attachments
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'agent')));
-- Agents/Admins can insert attachments for messages they are creating
CREATE POLICY "Agents/Admins can insert attachments for their messages." ON ticket_attachments
  FOR INSERT WITH CHECK (uploaded_by_user_id = auth.uid() AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'agent')));
-- Consider DELETE policies based on who should be able to delete attachments


-- Documentation Categories Table
CREATE TABLE documentation_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for documentation_categories
ALTER TABLE documentation_categories ENABLE ROW LEVEL SECURITY;

-- Policies for documentation_categories
-- All authenticated users can view categories
CREATE POLICY "Authenticated users can view categories." ON documentation_categories
  FOR SELECT USING (auth.role() = 'authenticated');
-- Admins/Agents can manage categories
CREATE POLICY "Admins/Agents can manage categories." ON documentation_categories
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'agent')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'agent')));


-- Documentation Articles Table
CREATE TABLE documentation_articles (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT REFERENCES documentation_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT, -- Consider using Markdown or similar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS for documentation_articles
ALTER TABLE documentation_articles ENABLE ROW LEVEL SECURITY;

-- Policies for documentation_articles
-- All authenticated users can view articles
CREATE POLICY "Authenticated users can view articles." ON documentation_articles
  FOR SELECT USING (auth.role() = 'authenticated');
-- Admins/Agents can manage articles
CREATE POLICY "Admins/Agents can manage articles." ON documentation_articles
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'agent')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'agent')));


-- Article Feedback Table
CREATE TABLE article_feedback (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT REFERENCES documentation_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5), -- e.g., 1 to 5 stars
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for article_feedback
ALTER TABLE article_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for article_feedback
-- Users can submit feedback
CREATE POLICY "Users can submit feedback." ON article_feedback
  FOR INSERT WITH CHECK (user_id = auth.uid());
-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback." ON article_feedback
  FOR SELECT USING (user_id = auth.uid());
-- Admins/Agents can view all feedback
CREATE POLICY "Admins/Agents can view all feedback." ON article_feedback
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'agent')));


-- Webinars Table
CREATE TABLE webinars (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ,
  recording_url TEXT, -- URL to the video (e.g., YouTube, Vimeo, Supabase Storage)
  presenter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for webinars
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;

-- Policies for webinars
-- All authenticated users can view webinars
CREATE POLICY "Authenticated users can view webinars." ON webinars
  FOR SELECT USING (auth.role() = 'authenticated');
-- Admins/Agents can manage webinars
CREATE POLICY "Admins/Agents can manage webinars." ON webinars
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'agent')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'agent')));


-- Create Storage Bucket for attachments (Run this manually or via Supabase dashboard/CLI)
-- NOTE: Bucket creation and policies are typically managed outside the migration script.
-- Example (conceptual - use Supabase dashboard/CLI):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('ticket_attachments', 'ticket_attachments', false);

-- Storage Policies (Conceptual - configure in Supabase dashboard):
-- Policy 1: Allow authenticated users to upload to a path based on their user_id and ticket_id.
-- Policy 2: Allow users to download files linked to messages on their tickets.
-- Policy 3: Allow agents/admins to upload/download all files.


-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update 'updated_at' on relevant tables
CREATE TRIGGER set_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_tickets_timestamp
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_documentation_articles_timestamp
BEFORE UPDATE ON documentation_articles
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_webinars_timestamp
BEFORE UPDATE ON webinars
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

