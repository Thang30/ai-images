-- First, clear any existing data
TRUNCATE TABLE images, users CASCADE;

-- Insert sample users
INSERT INTO users (email, password_hash) VALUES
  ('john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpR3EEGUb.jXkm'),  -- password: 'password123'
  ('alice@example.com', '$2a$12$ZGX8Yt5iXTzB9XwbhLSUn.11Y0Fd5AaQt5Kp0Uyh8GxvPGTOM3RJi'), -- password: 'test456'
  ('bob@example.com', '$2a$12$BHBVGHZgK8N.nhZ5vZk2h.S.6kkVqD9j9m9FbDl8bw6HWvGUOYsFW');   -- password: 'secure789'

-- Insert sample images
INSERT INTO images (user_id, image_url, prompt, negative_prompt, width, height) 
SELECT 
  u.id,
  'https://storage.example.com/image' || n || '.jpg',
  CASE (n % 3)
    WHEN 0 THEN 'A serene landscape with mountains'
    WHEN 1 THEN 'Futuristic cityscape at night'
    ELSE 'Abstract digital art with vibrant colors'
  END,
  CASE (n % 2)
    WHEN 0 THEN 'blurry, low quality'
    ELSE 'oversaturated, distorted'
  END,
  CASE (n % 2)
    WHEN 0 THEN 1024
    ELSE 512
  END,
  CASE (n % 2)
    WHEN 0 THEN 1024
    ELSE 512
  END
FROM users u
CROSS JOIN generate_series(1, 3) n; 