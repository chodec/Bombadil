import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SetRoleRequest {
  role: 'client' | 'trainer';
}

function getCookieValue(cookieString: string, name: string): string | null {
  if (!cookieString) return null;
  
  const cookies = cookieString.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return value;
    }
  }
  return null;
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true', 
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const cookieHeader = req.headers.get('Cookie');
    if (!cookieHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authentication cookies" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      );
    }

    const accessToken = getCookieValue(cookieHeader, 'access_token');
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Missing access token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      );
    }

    const body: SetRoleRequest = await req.json();

    if (!['client', 'trainer'].includes(body.role)) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid role",
          message: "Role must be either 'client' or 'trainer'" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role: body.role })
      .eq('id', user.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update user role", details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }}
      );
    }

    if (body.role === 'client') {
      const { error: clientError } = await supabaseAdmin
        .from('clients')
        .insert({
          user_id: user.id
        });

      if (clientError) {
        return new Response(
          JSON.stringify({ error: "Failed to create client profile", details: clientError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }}
        );
      }
    } else if (body.role === 'trainer') {
      const { error: trainerError } = await supabaseAdmin
        .from('trainers')
        .insert({
          user_id: user.id
        });

      if (trainerError) {
        return new Response(
          JSON.stringify({ error: "Failed to create trainer profile", details: trainerError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }}
        );
      }
      
      const subscriptionOfferId = 'c8491a12-3bfe-4d5e-9d2b-cadfa5b83990';
      
      const { error: activeSubscriptionError } = await supabaseAdmin
        .from('trainers_active_subscriptions')
        .insert({
          trainer_id: user.id,
          subscription_offer_id: subscriptionOfferId
        });

      if (activeSubscriptionError) {
        return new Response(
          JSON.stringify({ error: "Failed to set up basic subscription", details: activeSubscriptionError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }}
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        role: body.role,
        message: `Successfully set up as ${body.role}`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }}
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }}
    );
  }
});