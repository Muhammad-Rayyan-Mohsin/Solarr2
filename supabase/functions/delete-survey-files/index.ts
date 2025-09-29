// Supabase Edge Function: delete-survey-files
// Deletes an array of file paths from the private 'surveys' storage bucket
// Uses service role to bypass storage RLS safely

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { paths } = await req.json().catch(() => ({ paths: [] }));

    if (!Array.isArray(paths)) {
      return new Response(JSON.stringify({ error: 'Invalid body. Expected { paths: string[] }' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing Supabase environment variables' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    let removed = 0;
    let failed: string[] = [];

    if (paths.length > 0) {
      const { error } = await admin.storage.from('surveys').remove(paths);
      if (error) {
        // If bulk deletion failed, try individually to get partial success
        failed = [];
        for (const p of paths) {
          const { error: e } = await admin.storage.from('surveys').remove([p]);
          if (e) failed.push(p);
          else removed++;
        }
      } else {
        removed = paths.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, requested: paths.length, removed, failed }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (err) {
    console.error('delete-survey-files error', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});