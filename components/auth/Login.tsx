import LoginModal from '@/components/auth/LoginModal'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { loadUserLibraryFromSupabase } from '@/utils/userLibrary'

export default function Login() {

    const [showModal, setShowModal] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    
    const supabase = createClient()

    useEffect(() => {
        // Fetch user on mount
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null)
        })

        fetchUser()

        // Unsubscribe from auth state changes on unmount
        return () => subscription.unsubscribe()
    }, [supabase])

  return (
    <>
    {user ? (
        // User is logged in
        <div>
          <button
          className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md cursor-pointer text-center"
          onClick={() => supabase.auth.signOut()}
          >
              <span className="text-white">Logout</span>
          </button>
              <span className="text-green-600 font-bold ml-2 text-xs">{user.email}</span>
        </div>
    ) : (
        // User is not logged in
        <button
        className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md cursor-pointer text-center"
        onClick={() => setShowModal(true)}
        >
            <span className="text-white">Login</span>
        </button>
    )}
    {showModal && <LoginModal setShowModal={setShowModal} />}
    </>
  )
}
