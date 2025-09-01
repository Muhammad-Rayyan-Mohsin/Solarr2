# 🚀 Solar Survey Pro - Deployment Guide

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (free tier available)
- Git repository set up

## 🗄️ Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `solar-survey-pro`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to create all tables

### 1.3 Create Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. Create two buckets:
   - **Bucket Name**: `survey-photos`
     - **Public**: ✅ Yes
     - **File size limit**: 50MB
     - **Allowed MIME types**: image/*
   
   - **Bucket Name**: `survey-audio`
     - **Public**: ✅ Yes
     - **File size limit**: 100MB
     - **Allowed MIME types**: audio/*

### 1.4 Get API Keys

1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. You'll need these for the environment variables

## 🔧 Step 2: Configure Environment Variables

### 2.1 Create Environment File

1. Copy `env.example` to `.env`:
```bash
cp env.example .env
```

2. Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2.2 Environment Variables for Production

For production deployment, set these environment variables in your hosting platform:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🚀 Step 3: Deploy to Production

### Option A: Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel --prod
```

3. **Set Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add your Supabase URL and key

### Option B: Netlify

1. **Build the project**:
```bash
npm run build
```

2. **Deploy**:
   - Drag and drop the `dist` folder to [netlify.com](https://netlify.com)
   - Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

3. **Set Environment Variables**:
   - Go to **Site settings** → **Environment variables**
   - Add your Supabase credentials

### Option C: GitHub Pages

1. **Add deployment script** to `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

2. **Install gh-pages**:
```bash
npm install --save-dev gh-pages
```

3. **Deploy**:
```bash
npm run deploy
```

## 🔒 Step 4: Security Configuration

### 4.1 Row Level Security (RLS)

The database schema includes RLS policies that allow all operations. For production:

1. **Enable Authentication** (optional):
   - Go to **Authentication** → **Settings**
   - Configure your preferred auth provider

2. **Update RLS Policies**:
   - Modify the policies in `supabase-schema.sql`
   - Add user-specific restrictions

### 4.2 CORS Configuration

1. Go to **Settings** → **API**
2. Add your domain to **Additional Allowed Origins**:
   - `https://your-domain.vercel.app`
   - `https://your-domain.netlify.app`

## 📊 Step 5: Monitor and Maintain

### 5.1 Database Monitoring

1. **Supabase Dashboard**:
   - Monitor database usage
   - Check storage usage
   - View real-time logs

2. **Performance**:
   - Use the provided indexes for optimal performance
   - Monitor query performance in **Logs**

### 5.2 Storage Management

1. **Photo Storage**:
   - Photos are automatically compressed
   - Thumbnails are generated for faster loading
   - Consider implementing cleanup for old surveys

2. **Audio Storage**:
   - Audio files are stored in the `survey-audio` bucket
   - Consider implementing transcription services

## 🔄 Step 6: Data Flow

### Online Mode:
1. User fills survey → Data saves to Supabase immediately
2. Photos upload to Supabase Storage
3. Real-time updates across devices

### Offline Mode:
1. User fills survey → Data saves to IndexedDB
2. Photos stored locally with compression
3. Sync queue builds up

### Reconnection:
1. Sync service processes queued items
2. Data uploads to Supabase automatically
3. Conflict resolution handles any issues

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Check CORS settings in Supabase
   - Ensure domain is in allowed origins

2. **Storage Upload Failures**:
   - Check bucket permissions
   - Verify file size limits
   - Check MIME type restrictions

3. **Sync Issues**:
   - Check network connectivity
   - Verify Supabase credentials
   - Check browser console for errors

### Debug Mode:

Add this to your `.env` for debugging:
```env
VITE_DEBUG=true
```

## 📈 Performance Optimization

1. **Database Indexes**: Already included in schema
2. **Photo Compression**: Automatic thumbnail generation
3. **Caching**: Service worker caches static assets
4. **Lazy Loading**: Photos load on demand

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **RLS Policies**: Implement proper access controls
3. **File Validation**: Validate file types and sizes
4. **HTTPS**: Always use HTTPS in production

## 📞 Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs**: [netlify.com/docs](https://netlify.com/docs)

---

Your Solar Survey Pro app is now ready for production! 🎉
