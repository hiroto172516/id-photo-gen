import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!accessToken) {
    return NextResponse.json({ hasAccess: false, expiresAt: null });
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ hasAccess: false, expiresAt: null });
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return NextResponse.json({ hasAccess: false, expiresAt: null });
  }

  const { data: payment } = await supabase
    .from('payments')
    .select('expires_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .single();

  if (!payment) {
    return NextResponse.json({ hasAccess: false, expiresAt: null });
  }

  return NextResponse.json({
    hasAccess: true,
    expiresAt: payment.expires_at as string,
  });
}
