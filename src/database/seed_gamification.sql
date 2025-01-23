-- Seed data for badges
INSERT INTO public.badges (id, name, description, icon_url, category, requirement_type, requirement_value, archive) VALUES
('1', 'Premier Pas', 'Validez vos premiers pas', 'footsteps', 'steps', 'steps_validated', 1000, false),
('2', 'Marcheur du Dimanche', 'Validez 5000 pas en une journée', 'walk', 'steps', 'steps_validated', 5000, false),
('3', 'Marathonien', 'Validez 10000 pas en une journée', 'run-fast', 'steps', 'steps_validated', 10000, false),
('4', 'Première Semaine', 'Validez vos pas pendant 7 jours consécutifs', 'calendar-check', 'streak', 'daily_streak', 7, false),
('5', 'Premier Mois', 'Validez vos pas pendant 30 jours consécutifs', 'calendar-month', 'streak', 'daily_streak', 30, false);

-- Seed data for challenges
INSERT INTO public.challenges (id, title, description, type, category, goal_type, goal_value, reward_points, start_date, end_date, archive) VALUES
('1', 'Sprint du Weekend', 'Validez 15000 pas ce weekend', 'weekend', 'steps', 'steps_count', 15000, 100, CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days', false),
('2', 'Challenge Hebdo', 'Validez 50000 pas cette semaine', 'weekly', 'steps', 'steps_count', 50000, 250, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', false),
('3', 'Défi du Mois', 'Validez 200000 pas ce mois-ci', 'monthly', 'steps', 'steps_count', 200000, 1000, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', false);

-- Seed data for leaderboard (daily)
INSERT INTO public.leaderboard (user_id, period_type, period_date, steps_count, points_earned, rank) VALUES
('user1', 'daily', CURRENT_DATE, 12500, 125, 1),
('user2', 'daily', CURRENT_DATE, 10000, 100, 2),
('user3', 'daily', CURRENT_DATE, 8000, 80, 3),
('user4', 'daily', CURRENT_DATE, 6000, 60, 4),
('user5', 'daily', CURRENT_DATE, 4000, 40, 5);

-- Seed data for leaderboard (weekly)
INSERT INTO public.leaderboard (user_id, period_type, period_date, steps_count, points_earned, rank) VALUES
('user1', 'weekly', date_trunc('week', CURRENT_DATE), 75000, 750, 1),
('user2', 'weekly', date_trunc('week', CURRENT_DATE), 65000, 650, 2),
('user3', 'weekly', date_trunc('week', CURRENT_DATE), 55000, 550, 3),
('user4', 'weekly', date_trunc('week', CURRENT_DATE), 45000, 450, 4),
('user5', 'weekly', date_trunc('week', CURRENT_DATE), 35000, 350, 5);

-- Seed data for leaderboard (monthly)
INSERT INTO public.leaderboard (user_id, period_type, period_date, steps_count, points_earned, rank) VALUES
('user1', 'monthly', date_trunc('month', CURRENT_DATE), 300000, 3000, 1),
('user2', 'monthly', date_trunc('month', CURRENT_DATE), 250000, 2500, 2),
('user3', 'monthly', date_trunc('month', CURRENT_DATE), 200000, 2000, 3),
('user4', 'monthly', date_trunc('month', CURRENT_DATE), 150000, 1500, 4),
('user5', 'monthly', date_trunc('month', CURRENT_DATE), 100000, 1000, 5);

-- Seed data for user_badges (example for user1)
INSERT INTO public.user_badges (user_id, badge_id, earned_at) VALUES
('user1', '1', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('user1', '2', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('user1', '4', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Seed data for user_challenges (example for user1)
INSERT INTO public.user_challenges (user_id, challenge_id, progress, completed_at) VALUES
('user1', '1', 10000, NULL),
('user1', '2', 30000, NULL),
('user1', '3', 100000, NULL);
