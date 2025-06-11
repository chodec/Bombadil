import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface RegistrationRequest {
  email: string
  name: string
  password: string
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("🚀 Registration function started")

    // Parse request body
    const body: RegistrationRequest = await req.json()
    console.log("📥 Request received for:", body.email)

    // Validate required fields
    if (!body.email || !body.password || !body.name){
      console.error("❌ Missing required fields")
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(body.password)) {
      console.error("❌ Password is weak.")
      return new Response(
        JSON.stringify({ error: "❌ Password is weak." }),
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

    // Create user in auth.users
    console.log("👤 Creating user in auth...")
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      name: body.name,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.name
      }
    })

    if (authError) {
      console.error("❌ Auth error:", authError.message)
      return new Response(
        JSON.stringify({ error: "Failed to create user: " + authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    console.log("✅ User created with ID:", authData.user?.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: authData.user?.id,
        message: "User registered successfully" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )

  } catch (error) {
    console.error("💥 Unexpected error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})