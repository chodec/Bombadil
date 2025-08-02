import { supabase } from '@/lib/supabase';

export const createUserRecord = async (authUser: any, registrationMethod: string) => {
  try {
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (!existingUser) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
          role: 'pending',
          registration_method: registrationMethod
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          const { data: existingById, error: idCheckError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
          
          if (!idCheckError && existingById) {
            return existingById;
          }
          
          const { data: existingByEmail, error: emailCheckError } = await supabase
            .from('users')
            .select('*')
            .eq('email', authUser.email)
            .maybeSingle();
          
          if (!emailCheckError && existingByEmail) {
            return existingByEmail;
          }
        }
        
        throw insertError;
      }

      return newUser;
    } else {
      return existingUser;
    }
  } catch (error) {
    throw error;
  }
};