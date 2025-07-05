import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface LoginRequest {
  email: string
  password: string
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:5173', 
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
  }

  console.log('Request method:', req.method)
  console.log('Request headers:', req.headers)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    })
  }

  try {
    // Parse request body
    const body: LoginRequest = await req.json()

    // Sanitize inputs
    const sanitize = (input: string) => {
      return input
        .trim()
        .replace(/[<>]/g, '') // Remove < >
        .slice(0, 255) // Max length
    }

    body.email = sanitize(body.email)
    // Don't sanitize password - can break special characters needed for auth
  
    // Validate required fields
    if (!body.email || !body.password) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          error_input: "all",
          message: "Email and password are required."
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid email format",
          error_input: "email",
          message: "Please enter a valid email address." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Basic password validation (minimum length)
    if (body.password.length < 8) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid password",
          error_input: "password",
          message: "Password must be at least 8 characters long." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create Supabase client with anon key for auth operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Attempt to sign in the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password
    })

    if (authError) {
      console.error('Auth error:', authError)
      
      // Handle specific auth errors
      if (authError.message.includes('Invalid login credentials')) {
        return new Response(
          JSON.stringify({ 
            error: "Invalid credentials",
            error_input: "password",
            message: "Invalid email or password. Please check your credentials and try again."
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      if (authError.message.includes('Email not confirmed')) {
        return new Response(
          JSON.stringify({ 
            error: "Email not confirmed",
            error_input: "email",
            message: "Please confirm your email address before logging in."
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      if (authError.message.includes('Too many requests')) {
        return new Response(
          JSON.stringify({ 
            error: "Too many attempts",
            error_input: "all",
            message: "Too many login attempts. Please try again later."
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      // Generic auth error
      return new Response(
        JSON.stringify({ 
          error: "Login failed",
          message: "Unable to log in. Please try again."
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Get user profile from users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, created_at, registration_method')
      .eq('id', authData.user?.id)
      .single()

    if (userError) {
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

    // Check user role and determine if role selection is needed
    let needsRoleSelection = false

    if (userData.role === 'pending' || !userData.role) {
      // User needs to select role
      needsRoleSelection = true
    } else if (userData.role === 'client') {
      // Check if client profile exists
      const { data: clientData, error: clientError } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('user_id', userData.id)
        .single()
      
      if (clientError || !clientData) {
        console.warn('Client profile missing for user:', userData.id)
        // Client profile missing - need to create it or role is inconsistent
        needsRoleSelection = true
      }
    } else if (userData.role === 'trainer') {
      // Check if trainer profile exists
      const { data: trainerData, error: trainerError } = await supabaseAdmin
        .from('trainers')
        .select('id')
        .eq('user_id', userData.id)
        .single()
      
      if (trainerError || !trainerData) {
        console.warn('Trainer profile missing for user:', userData.id)
        // Trainer profile missing - need to create it or role is inconsistent
        needsRoleSelection = true
      }
    } else {
      // For admin or other roles, no role selection needed
      needsRoleSelection = false
    }

    // Update last login timestamp
    if (authData.user?.id) {
      await supabaseAdmin
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id)
    }

    const headers = new Headers({
      ...corsHeaders,
      "Content-Type": "application/json"
    })

    headers.append('Set-Cookie', `access_token=${authData.session?.access_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`)
    headers.append('Set-Cookie', `refresh_token=${authData.session?.refresh_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`)

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
          name: userData?.name || authData.user?.user_metadata?.full_name,
          role: userData?.role || 'pending'
        },
        needsRoleSelection: needsRoleSelection,
        message: needsRoleSelection 
          ? "Login successful. Please complete your profile setup." 
          : "Login successful. Welcome back!"
      }),
      { 
        status: 200,
        headers: headers
      }
    )
        

  } catch (error) {
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({ 
        error: "Server error",
        message: "An unexpected error occurred during login." 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})