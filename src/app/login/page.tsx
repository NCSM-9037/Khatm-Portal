'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'magic') {
        const { error: magicError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (magicError) throw magicError
        setMessage('Check your email for the magic link!')
      } else {
        if (isSignUp) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name },
            }
          })
          if (signUpError) throw signUpError
          setMessage('Signed up successfully! You can now log in.')
          setIsSignUp(false)
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (signInError) throw signInError
          router.push('/dashboard')
          router.refresh()
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-[var(--radius-card)] p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6 font-heading">
          {mode === 'magic' ? 'Log in with Magic Link' : (isSignUp ? 'Create an Account' : 'Welcome Back')}
        </h1>

        {error && (
          <div className="bg-alert/10 text-alert p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-success/10 text-success p-3 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-[var(--radius-control)] bg-surface border-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {mode === 'password' && isSignUp && (
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-[var(--radius-control)] bg-surface border-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {mode === 'password' && (
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-[var(--radius-control)] bg-surface border-muted/30 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-surface font-medium py-2 rounded-[var(--radius-control)] transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              mode === 'magic' ? 'Send Magic Link' : (isSignUp ? 'Sign Up' : 'Log In')
            )}
          </button>
        </form>

        <div className="mt-6 space-y-4 text-sm text-center text-muted">
          {mode === 'password' && (
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setMessage('')
                }} 
                className="text-primary hover:underline font-medium"
              >
                {isSignUp ? 'Log in' : 'Sign up'}
              </button>
            </p>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted">Or</span>
            </div>
          </div>

          <button
            onClick={() => {
              setMode(mode === 'magic' ? 'password' : 'magic')
              setError('')
              setMessage('')
            }}
            className="text-primary hover:underline font-medium"
          >
            {mode === 'magic' ? 'Use password instead' : 'Email me a login link'}
          </button>
        </div>
      </div>
    </div>
  )
}
