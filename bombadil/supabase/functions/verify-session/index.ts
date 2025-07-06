import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function getCookieValue(cookieString: string, name: string): string | null {
  if (!cookieString) return null
  
  const cookies = cookieString.split(';')
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=')
    if (key === name) {
      return value
    }
  }
  return null
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:5173', 
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
  }

  console.log('Request method:', req.method)
  console.log('Request headers:', req.headers)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    })
  }

  try {
    const cookieHeader = req.headers.get('Cookie')
    console.log('Cookie header:', cookieHeader)
    
    if (!cookieHeader) {
      return new Response(
        JSON.stringify({ error: "No session found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      )
    }

    const accessToken = getCookieValue(cookieHeader, 'access_token')
    console.log('Access token found:', !!accessToken)
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      )
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      console.error('User data error:', userError)
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role || 'pending'
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }}
    )

  } catch (error) {
    console.error('Session verification error:', error)
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }}
    )
  }
})