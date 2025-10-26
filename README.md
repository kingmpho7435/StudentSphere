# Student Sphere Web App 

**A peer-to-peer marketplace connecting students across South African universities**

Student Sphere is a platform where students can offer and discover services within their university community - from tutoring and tech repairs to meal prep and freelance work. Built with vanilla HTML, CSS (Bootstrap 5), and JavaScript for simplicity and performance.

## About the Project

Student Sphere empowers students to monetize their skills and find affordable services within their university network. Whether you need a Python tutor, laptop repair, or homemade meals, Student Sphere connects you with verified students offering these services. Student Sphere provides students with an opportunity to create an extra income and gain work experience.

### Why Student Sphere?

- **Student-Focused**: Only university students can join, creating a trusted community
- **Affordable**: Students offer competitive prices compared to commercial services
- **Convenient**: Find services on campus or nearby
- **Verified**: University email verification ensures authenticity
- **Direct Contact**: WhatsApp integration for instant communication

### Target Audience

- University students in South Africa
- Students looking to earn extra income
- Students seeking affordable services
- Students looking to gain an income for their skills
- Students with the heart for entrepunership

## Features

### For Service Seekers
- **Browse Services** - Search and filter by category, university, and keywords
- **Direct Contact** - Message sellers instantly via WhatsApp
- **Reviews & Ratings** - See verified reviews from other students
- **University Filter** - Find services at your campus
- **Payment Options** - See accepted payment methods (Cash, EFT, SnapScan, etc.)

### For Service Providers
- **Post Services** - Create listings with images and descriptions
- **Set Your Price** - Control your rates
- **Manage Profile** - Track your services, earnings, and reviews
- **Verification Badge** - Build trust with verified student status
- **Mobile Friendly** - Manage services on the go

### Technical Features
- **Fast Loading** - No build process, instant page loads
- **Responsive Design** - Works on all devices
- **Modern UI** - Bootstrap 5 with custom styling
- **Secure Auth** - Supabase authentication 
- **Real-time Data** - Live updates with Supabase 

## Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styles with CSS variables
- **Bootstrap 5.3** - Responsive UI framework
- **Bootstrap Icons** - Icon library
- **Vanilla JavaScript (ES6+)** - No frameworks, pure JS

### Backend 
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database

### Deployment
- **Netlify** - Static site hosting

## ----------------- Getting Started ------------------------

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code, Sublime Text, etc.)
- Internet connection (for CDN resources)

### Local Development

1. **Clone or download the project**
   ```bash
   git clone https://github.com/yourusername/StudentSphere.git
   cd StudentSphere
   ```

2. **Open in browser**
   ```bash
   # Option 1: Just double-click index.html
   
   # Option 2: Use a local server (recommended)
   python -m http.server 8000
   # Then open: http://localhost:8000
   
   # Option 3: Use VS Code Live Server extension
   # Right-click index.html → "Open with Live Server"
   ```

3. **Test the application**
   - Browse services on `browse.html`
   - View service details on `service-detail.html?id=1`
   - Try creating a service on `create-service.html`
   - Test login on `login.html` (demo mode)

### Demo Mode

The application includes demo data for testing:
- **8 sample services** across different categories
- **10 South African universities**
- **Sample reviews and ratings**
- **Demo authentication** (uses localStorage)

**Demo Login Credentials:**
- Email: Any valid email format (e.g., `test@uct.ac.za`)
- Password: Any 6+ characters (e.g., `123456`)

## Supabase Integration

### Why Supabase?

Supabase provides a complete backend solution:
- **PostgreSQL Database** - Store services, users, reviews
- **Authentication** - Email/password, OAuth, magic links
- **Storage** - Upload and serve service images
- **Real-time** - Live updates when services are posted
- **Row Level Security** - Secure data access
- **Free Tier** - 500MB database, 1GB storage, 50MB file uploads

### Step 1: Create Supabase Project (steps)

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: `student-sphere`
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to South Africa (e.g., Cape Town)
5. Click "Create new project" 

### Step 2: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste this schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  university TEXT NOT NULL,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  university TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  payment_methods TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table (reference data)
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL
);

-- Insert default categories
INSERT INTO categories (id, name, icon, color) VALUES
  ('tutoring', 'Tutoring', 'book', 'primary'),
  ('tech', 'Tech Services', 'laptop', 'purple'),
  ('beauty', 'Beauty & Wellness', 'scissors', 'pink'),
  ('food', 'Food & Catering', 'utensils', 'orange'),
  ('transport', 'Transport', 'car', 'success');

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Services policies
CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can create services"
  ON services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services"
  ON services FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services"
  ON services FOR DELETE
  USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Create indexes for performance
CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_university ON services(university);
CREATE INDEX idx_services_created_at ON services(created_at DESC);
CREATE INDEX idx_reviews_service_id ON reviews(service_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
4. Click "Run" to execute the schema

### Step 3: Set Up Storage

1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Name it: `service-images`
4. Make it **Public** (so images can be viewed)
5. Click "Create bucket"

6. Set up storage policies:
```sql
-- Allow public read access
CREATE POLICY "Public can view service images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'service-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to delete own images
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'service-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Step 4: Get API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)


### Step 5: Configure Your App

1. Create a `.env` file in your project root:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
```

2. Create `js/supabase-client.js`:
```javascript
// Supabase Client Configuration
const SUPABASE_URL = 'https://xxxxx.supabase.co'; // Replace with your URL
const SUPABASE_ANON_KEY = 'eyJhbGc...'; // Replace with your key

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

3. Add Supabase JS library to your HTML files (before closing `</body>`):
```html
<!-- Supabase JS Client -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-client.js"></script>
```

### Step 6: Update JavaScript Files

#### Update `js/auth.js` for Supabase Auth:

```javascript
// Replace demo authentication with Supabase
```
##### Then Update `js/services.js` for Supabase Data:

```javascript
// Replace demo data with Supabase queries
```



