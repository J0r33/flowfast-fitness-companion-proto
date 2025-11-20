-- Fix existing invalid primary_goal values in user_profiles table
UPDATE user_profiles 
SET primary_goal = CASE 
  WHEN primary_goal = 'strength' THEN 'get_stronger'
  WHEN primary_goal = 'muscle' THEN 'get_toned'
  WHEN primary_goal = 'endurance' THEN 'general_fitness'
  WHEN primary_goal = 'weight_loss' THEN 'lose_weight'
  WHEN primary_goal = 'flexibility' THEN 'general_fitness'
  ELSE primary_goal
END
WHERE primary_goal IN ('strength', 'muscle', 'endurance', 'weight_loss', 'flexibility');