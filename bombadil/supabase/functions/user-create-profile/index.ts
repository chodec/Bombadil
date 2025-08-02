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

        const { data: existingUser, error: checkError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (checkError) {
            console.error('Error checking for existing user:', checkError);
            throw checkError;
        }

        if (!existingUser) {
            console.log('User not found. Inserting new user...');
            const { data: newUser, error: insertError } = await supabaseAdmin
                .from('users')
                .insert({
                    id: id,
                    email: email,
                    name: name,
                    role: 'pending',
                    registration_method: registration_method
                })
                .select();
            
            if (insertError) {
                console.error('Error inserting new user:', insertError);
                throw insertError;
            }
            console.log('User inserted successfully. Returning response.');
            return new Response(JSON.stringify(newUser), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        console.log('User found. Returning existing user data.');
        return new Response(JSON.stringify(existingUser), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Final error in catch block:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});