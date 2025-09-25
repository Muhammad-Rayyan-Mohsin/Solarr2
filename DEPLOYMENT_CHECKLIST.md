# Supabase Backend Deployment Checklist

## ✅ Completed Steps

1. **Database Schema** - ✅ Created and deployed
   - File: `supabase-survey-schema.sql`
   - Status: ✅ Run in Supabase SQL Editor

2. **Storage Bucket** - ✅ Created
   - Bucket name: `surveys`
   - Status: ✅ Private bucket created

3. **Storage Policies** - ✅ Applied
   - File: `supabase-storage-policies.sql`
   - Status: ✅ Run in Supabase SQL Editor

## 🚀 Next Steps

### 4. Deploy Edge Function

**Function Name:** `generate-survey-pdf`

**Environment Variables to Set:**
```
SUPABASE_URL=https://jmjvcvahzmmugonhyiuo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptanZjdmFoem1tdWdvbmh5aXVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODgyODE2NCwiZXhwIjoyMDc0NDA0MTY0fQ.IYU-aWDv4vBkJmN_Ei4FERi5_ia2VX1QCiCCSJKCHzc
```

**Code to Deploy:**
- Copy contents from: `supabase-edge-function-generate-pdf-fixed.ts`
- Paste into Supabase Dashboard → Functions → New Edge Function

### 5. Test the Backend

**Option A: Browser Console Test**
1. Open your app in browser
2. Open Developer Console (F12)
3. Copy and paste the contents of `test-backend.js`
4. Run the test

**Option B: Node.js Test**
```bash
node test-backend.js
```

### 6. Update Your Frontend

**Environment Variables** (add to your `.env` file):
```
VITE_SUPABASE_URL=https://jmjvcvahzmmugonhyiuo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptanZjdmFoem1tdWdvbmh5aXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MjgxNjQsImV4cCI6MjA3NDQwNDE2NH0.dmmFhiAImi4ZtpOVRiTaeaHUHsQIm9z7kqU8YbOqdVE
```

**Integration Steps:**
1. Copy `src/services/surveyService.ts` to your project
2. Update your form submission in `src/pages/Index.tsx`:

```typescript
import { SurveyService } from '@/services/surveyService'

// In your submit handler:
const handleSubmit = async () => {
  try {
    // Save the survey data
    const surveyId = await SurveyService.saveSurvey(formData)
    
    // Upload photos and signatures
    for (const photo of photosToUpload) {
      await SurveyService.uploadAsset(
        surveyId,
        photo.file,
        photo.section,
        photo.field,
        'photo'
      )
    }
    
    // Generate PDF
    const pdfUrl = await SurveyService.generatePDF(surveyId)
    
    console.log('Survey saved! PDF:', pdfUrl)
  } catch (error) {
    console.error('Submit failed:', error)
  }
}
```

## 🧪 Testing Commands

### Test Database Connection
```sql
-- Run in Supabase SQL Editor
SELECT * FROM surveys_list LIMIT 5;
```

### Test RPC Function
```sql
-- Run in Supabase SQL Editor (with test data)
SELECT create_full_survey('{"customerName": "Test Customer", "siteAddress": "123 Test St", "postcode": "TE1 1ST", "phone": "01234567890", "email": "test@example.com", "surveyDate": "2024-01-01", "surveyorInfo": {"name": "Test Surveyor", "telephone": "01234567890", "email": "test@example.com"}}'::jsonb);
```

### Test Edge Function
```bash
curl "https://jmjvcvahzmmugonhyiuo.supabase.co/functions/v1/generate-survey-pdf?survey_id=YOUR_SURVEY_ID" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## 📋 What You Can Do Now

✅ **Store complete survey data** - All form fields captured  
✅ **Upload photos and signatures** - Organized by section/field  
✅ **Generate professional PDFs** - Comprehensive reports  
✅ **Browse old surveys** - Search and filter functionality  
✅ **Secure data access** - Row-level security enabled  
✅ **Scalable architecture** - Built on Supabase infrastructure  

## 🔧 Troubleshooting

**If Edge Function fails:**
1. Check environment variables are set correctly
2. Verify service role key has proper permissions
3. Check function logs in Supabase Dashboard

**If database errors occur:**
1. Verify all tables were created successfully
2. Check RLS policies are applied
3. Ensure user authentication is working

**If storage uploads fail:**
1. Verify bucket exists and is private
2. Check storage policies are applied
3. Ensure user has proper permissions

## 📞 Support

Your Supabase Project Details:
- **Project ID:** jmjvcvahzmmugonhyiuo
- **URL:** https://jmjvcvahzmmugonhyiuo.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/jmjvcvahzmmugonhyiuo
