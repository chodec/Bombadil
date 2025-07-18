import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface GoogleAuthRequest {
  access_token: string 
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:5173', 
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  console.log('Request method:', req.method)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    })
  }

  try {
    const body: GoogleAuthRequest = await req.json()

    if (!body.access_token) {
      return new Response(
        JSON.stringify({
          error: "Missing access token",
          message: "Google access token is required."
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
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

    const { data: { user }, error: authError } = await supabase.auth.getUser(body.access_token)
    
    if (authError || !user) {
      console.error('Google auth error:', authError)
      return new Response(
        JSON.stringify({ 
          error: "Invalid Google session",
          message: "Could not verify Google authentication."
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    console.log('Google user:', user)
    console.log('Google user metadata:', user.user_metadata)

    let { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, created_at, registration_method')
      .eq('id', user.id)
      .single()

    if (userError && userError.code === 'PGRST116') {
      console.log('Creating new Google user profile')
      
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
          role: 'pending',
          registration_method: 'google'
        }])
        .select('id, email, name, role, created_at, registration_method')
        .single()

      if (insertError) {
        console.error('Failed to create user profile:', insertError)
        return new Response(
          JSON.stringify({ 
            error: "Profile creation failed",
            message: "Could not create user profile."
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      userData = newUser
    } else if (userError) {
      console.error('User data error:', userError)
      return new Response(
        JSON.stringify({ 
          error: "User data error",
          message: "Could not fetch user profile." 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    let needsRoleSelection = false
    if (userData.role === 'pending' || !userData.role) {
      needsRoleSelection = true
    }

    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!
    })

    if (sessionError) {
      console.error('Session generation error:', sessionError)
      return new Response(
        JSON.stringify({ 
          error: "Session creation failed",
          message: "Could not create secure session."
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    const headers = new Headers({
      ...corsHeaders,
      "Content-Type": "application/json"
    })

    headers.append('Set-Cookie', `access_token=${body.access_token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600`)
    
    const refreshToken = `google_${user.id}_${Date.now()}`
    headers.append('Set-Cookie', `refresh_token=${refreshToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800`)

    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.log('Could not sign out Google session:', e)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: userData?.name || user.user_metadata?.full_name,
          role: userData?.role || 'pending'
        },
        needsRoleSelection: needsRoleSelection,
        message: needsRoleSelection 
          ? "Google sign-in successful. Please complete your profile setup." 
          : "Google sign-in successful. Welcome back!"
      }),
      { 
        status: 200,
        headers: headers
      }
    )

  } catch (error) {
    console.error('Google auth bridge error:', error)
    return new Response(
      JSON.stringify({ 
        error: "Server error",
        message: "An unexpected error occurred during Google authentication." 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})