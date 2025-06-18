import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface RegistrationRequest {
  email: string
  name: string
  password: string
  passwordRepeat: string
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
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
    const body: RegistrationRequest = await req.json()

    // Sanitize inputs
    const sanitize = (input: string) => {
      return input
        .trim()
        .replace(/[<>]/g, '') // Remove < >
        .slice(0, 255) // Max length
    }

    body.email = sanitize(body.email)
    body.name = sanitize(body.name)
    // Don't sanitize passwords - can break special characters needed for auth
  
    // Validate required fields
    if (!body.email || !body.password || !body.name || !body.passwordRepeat){
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          error_input: "all",
          message: "All fields are required. Please fill in all required information."
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

    // Block disposable email domains
    const disposableDomains = [
      'tempmail.com', '10minutemail.com', 'guerrillamail.com', 
      'mailinator.com', 'yopmail.com', 'temp-mail.org'
    ]
    
    const emailDomain = body.email.split('@')[1]?.toLowerCase()
    if (disposableDomains.includes(emailDomain)) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid email provider",
          error_input: "email",
          message: "Please use a permanent email address." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Validate password strength
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(body.password)) {
      return new Response(
        JSON.stringify({ 
          error: "Password requirements not met",
          error_input: "password",
          message: "Password must be at least 8 characters long and contain uppercase letter, lowercase letter, number, and special character." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Validate password match
    if (body.password !== body.passwordRepeat) {
      return new Response(
        JSON.stringify({ 
          error: "Password mismatch",
          error_input: "passwordRepeat",
          message: "Password confirmation does not match. Please verify your password." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // check for duplicate
    const { count, error: checkError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('email', body.email)
    
    if (count && count > 0) {
    return new Response(
      JSON.stringify({ 
        error: "Email already exists",
        error_input: "email",
        message: "User with this email already exists"
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.name
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ 
          error: "Registration failed",
          message: authError.message
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Insert into users table
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          id: authData.user?.id, 
          email: body.email, 
          name: body.name, 
          registration_method: authData.user?.app_metadata?.provider || "email"
        }
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: "Database error",
          message: error.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: authData.user?.id,
        message: "Account created successfully. Welcome aboard!" 
      }),
      { 
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )

  } catch (error) {
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({ 
        error: "Server error",
        message: "An unexpected error occurred." 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})