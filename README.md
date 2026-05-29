# Institute Awards Online Platform

A modern, full-stack recognition portal built with React, TypeScript, and Supabase.

## Features

- **Public Portal**: Modern purple-themed landing page with search and filtering for awards.
- **Admin Dashboard**: Secure blue-themed dashboard for managing awards and users.
- **Role-Based Access**: Support for `admin` and `super_admin` roles.
- **Approval Workflow**: New admins are `pending` by default and must be approved.
- **Media Support**: Support for external image URLs and Supabase Storage uploads.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Lucide React.
- **Backend/DB**: Supabase (PostgreSQL, Auth, Storage).
- **Deployment**: Vercel.

## Getting Started

### 1. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com).
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`.
3. Go to **Storage**, create a public bucket named `award-images`.
4. Go to **Authentication** > **Providers** and enable **Google**.
   - You will need to set up Google OAuth credentials in the Google Cloud Console.
   - Add the Supabase callback URL to your Google OAuth config.

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. First Admin Setup

After your first Google Sign-in, your account will be `pending`. To become a Super Admin:

1. Copy your `id` from the `auth.users` table in Supabase.
2. Run this SQL in the editor:

```sql
insert into admin_users (
  auth_user_id,
  full_name,
  email,
  role,
  status
)
values (
  'YOUR_AUTH_USER_ID',
  'Your Name',
  'your-email@example.com',
  'super_admin',
  'approved'
);
```

### 4. Installation

```bash
npm install
npm run dev
```

## Deployment

Deploy to Vercel easily:
1. Push your code to GitHub.
2. Connect the repo to Vercel.
3. Add the environment variables.
4. Deploy!
