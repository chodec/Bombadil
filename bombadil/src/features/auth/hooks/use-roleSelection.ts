import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth/providers/auth-provider';

export const useRoleSelection = () => {
  const navigate = useNavigate();
  const { user: authUser, refreshProfile } = useAuth(); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrainerRecord = async (userId: string) => {
    try {
      const { data: existingTrainer, error: checkError } = await supabase
        .from('trainers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (!existingTrainer) {
        const { data: newTrainer, error: insertError } = await supabase
          .from('trainers')
          .insert({
            user_id: userId,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        return newTrainer;
      } else {
        return existingTrainer;
      }
    } catch (error) {
      console.error('Error creating trainer record:', error);
      throw error;
    }
  };

  const createClientRecord = async (userId: string) => {
    try {
      const { data: existingClient, error: checkError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (!existingClient) {
        const { data: newClient, error: insertError } = await supabase
          .from('clients')
          .insert({
            user_id: userId,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        return newClient;
      } else {
        return existingClient;
      }
    } catch (error) {
      console.error('Error creating client record:', error);
      throw error;
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

        
      if (updateError) {
        throw updateError;
      }
      
      if (role === 'trainer') {
        await createTrainerRecord(userId);
      } else if (role === 'client') {
        await createClientRecord(userId);
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const handleRoleSelect = async (role: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!authUser) {
        throw new Error('User not authenticated');
      }

      await updateUserRole(authUser.id, role);

      await refreshProfile();

      switch (role) {
        case 'client':
            navigate('/client/dashboard');
            break;
        case 'trainer':
            navigate('/trainer/dashboard');
            break;
        default:
            navigate('/');
            break;
      }

    } catch (err: any) {
      console.error('Error selecting role:', err);
      setError(err.message || 'Failed to select role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleRoleSelect,
  };
};
