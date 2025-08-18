import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        console.log('Function started.');
        const { id, email, name, registration_method } = await req.json();
        console.log(`Received data for user ID: ${id}`);

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: user, error: upsertError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: id,
                email: email,
                name: name,
                role: 'pending',
                registration_method: registration_method
            }, {
                onConflict: 'id'
            })
            .select()
            .maybeSingle();

        if (upsertError) {
            console.error('Error with upsert operation:', upsertError);
            throw upsertError;
        }

        console.log('User data processed successfully.');
        return new Response(JSON.stringify(user), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Final error in catch block:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});