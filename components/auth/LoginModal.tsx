import { useState } from "react"
import { createClient } from '@/utils/supabase/client'

export default function LoginModal({ setShowModal }: { setShowModal: (showModal: boolean) => void }) {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const supabase = createClient()

    const closeModal = () => {
        setShowModal(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage(null)

        let error = null
        
        if (mode === 'login') {
            ({ error } = await supabase.auth.signInWithPassword({
                email,
                password,
            }))
        } else {
            ({ error } = await supabase.auth.signUp({
                email,
                password,
            }))
        }

        if (!error) {
            closeModal()
        } else {
            setErrorMessage(error.message ?? 'An unknown error occurred')
        }

    }

    return (
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-10 backdrop-blur-sm">
            <div id="login-modal" className="bg-white/25 backdrop-blur-sm p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">{mode === 'login' ? 'Login' : 'Signup'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500" required />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md cursor-pointer text-center">
                        {mode === 'login' ? 'Login' : 'Signup'}
                    </button>
                </form>
                <p className="text-sm text-gray-500 mt-4">
                    {mode === 'login' ? 'Don\'t have an account?' : 'Already have an account?'}
                    <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-indigo-600 hover:text-indigo-700 transition duration-150 cursor-pointer">
                        {mode === 'login' ? 'Signup' : 'Login'}
                    </button>
                </p>
                {errorMessage && <p className="text-red-500 text-sm mt-4 text-center justify-center items-center text-center">{errorMessage}</p>}
                <button onClick={() => {closeModal()}} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md cursor-pointer text-center">
                    <span className="text-white">Close</span>
                </button>
            </div>
        </div>
    )
}