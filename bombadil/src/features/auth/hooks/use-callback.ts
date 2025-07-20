import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/providers/auth-provider'

export const useAuthCallback = () => {
  const navigate = useNavigate()
  const { refreshSession } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasProcessed = useRef(false)

  const createUserRecord = async (authUser: any) => {
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking existing user:', checkError)
        throw checkError
      }

      console.log(existingUser)

      if (!existingUser) {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
            role: 'pending',
            registration_method: 'oauth'
          })
          .select()
          .single()

        if (insertError) {
          // Pokud je error kvůli duplicitnímu záznamu, zkusíme najít existujícího uživatele
          if (insertError.code === '23505') {
            console.log('Duplicate key error, looking for existing user')
            
            // Zkusit najít podle ID
            const { data: existingById, error: idCheckError } = await supabase
              .from('users')
              .select('*')
              .eq('id', authUser.id)
              .maybeSingle()
            
            if (!idCheckError && existingById) {
              console.log('Found existing user by ID:', existingById)
              return existingById
            }
            
            // Zkusit najít podle emailu
            const { data: existingByEmail, error: emailCheckError } = await supabase
              .from('users')
              .select('*')
              .eq('email', authUser.email)
              .maybeSingle()
            
            if (!emailCheckError && existingByEmail) {
              console.log('Found existing user by email:', existingByEmail)
              return existingByEmail
            }
          }
          
          throw insertError
        }

        return newUser
      } else {
        return existingUser
      }
    } catch (error) {
      console.error('Error creating user record:', error)
      throw error
    }
  }

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Callback error:', error)
          setError('Failed to authenticate')
          setTimeout(() => navigate('/auth/login'), 2000)
          return
        }

        if (data.session?.user) {
          const userRecord = await createUserRecord(data.session.user)

          if (!userRecord.role || userRecord.role === 'pending') {
            localStorage.setItem('user', JSON.stringify({
              ...data.session.user,
              role: userRecord.role,
              name: userRecord.name
            }))
            
            // Vynuť refresh AuthProvider
            await refreshSession()
            
            navigate('/auth/role-selection')
          } else {
            localStorage.setItem('user', JSON.stringify({
              ...data.session.user,
              role: userRecord.role,
              name: userRecord.name
            }))
            
            // Vynuť refresh AuthProvider  
            await refreshSession()
            
            switch (userRecord.role) {
              case 'trainer': 
                navigate('/trainer/dashboard') 
                break
              case 'client': 
                navigate('/client/dashboard') 
                break
              case 'admin': 
                navigate('/admin/dashboard') 
                break
              default: 
                navigate('/')
            }
          }
        } else {
          navigate('/auth/login')
        }
      } catch (err) {
        console.error('Callback error:', err)
        setError('An error occurred during authentication')
        setTimeout(() => navigate('/auth/login'), 2000)
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [navigate])

  return {
    loading,
    error
  }
}