import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface SetRoleRequest {
  role: 'client' | 'trainer'
}

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
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true', 
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  console.log('Request method:', req.method)
  console.log('Request headers:', req.headers)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    // Get access token from cookies
    const cookieHeader = req.headers.get('Cookie')
    if (!cookieHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authentication cookies" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      )
    }

    const accessToken = getCookieValue(cookieHeader, 'access_token')
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Missing access token" }),
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

    // Get current user using access token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      )
    }

    const body: SetRoleRequest = await req.json()

    // Validate role
    if (!['client', 'trainer'].includes(body.role)) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid role",
          message: "Role must be either 'client' or 'trainer'" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      )
    }

    // Update user role
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role: body.role })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user role:', updateError)
      return new Response(
        JSON.stringify({ error: "Failed to update user role" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      )
    }

    // Create profile in appropriate table
    if (body.role === 'client') {
      const { error: clientError } = await supabaseAdmin
        .from('clients')
        .insert({
          user_id: user.id
        })

      if (clientError) {
        console.error('Error creating client profile:', clientError)
        return new Response(
          JSON.stringify({ error: "Failed to create client profile" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }}
        )
      }
    } else if (body.role === 'trainer') {
      const { error: trainerError } = await supabaseAdmin
        .from('trainers')
        .insert({
          user_id: user.id
        })

      if (trainerError) {
        console.error('Error creating trainer profile:', trainerError)
        return new Response(
          JSON.stringify({ error: "Failed to create trainer profile" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }}
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        role: body.role,
        message: `Successfully set up as ${body.role}`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }}
    )

  } catch (error) {
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }}
    )
  }
})