-- Make display_name required in user_profiles table
-- Set default value for existing users
UPDATE public.user_profiles 
SET display_name = 'User' 
WHERE display_name IS NULL OR display_name = '';

-- Alter column to be NOT NULL
ALTER TABLE public.user_profiles 
ALTER COLUMN display_name SET NOT NULL;

-- Set default for new rows
ALTER TABLE public.user_profiles 
ALTER COLUMN display_name SET DEFAULT 'User';