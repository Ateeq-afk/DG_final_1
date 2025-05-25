// src/pages/SignInPage.tsx
import React, { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Truck, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LoadingScreen from '@/components/auth/LoadingScreen'
import SignInForm from '@/components/auth/SignInForm'
import SignUpForm from '@/components/auth/SignUpForm'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import EmailVerification from '@/components/auth/EmailVerification'

type View = 'signIn' | 'signUp' | 'forgotPassword' | 'verifyEmail'

export default function SignInPage() {
  const { user, loading } = useAuth()
  const location = useLocation<{ from?: { pathname: string } }>()
  const navigate = useNavigate()
  const [view, setView] = useState<View>('signIn')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Determine post-login redirect target
  const redirectTo = location.state?.from?.pathname ?? '/dashboard'

  // Show loading spinner while auth state initializes
  if (loading) return <LoadingScreen />
  // If already signed in, redirect
  if (user) return <Navigate to={redirectTo} replace />

  // On successful authentication, navigate away
  function handleSuccess() {
    navigate(redirectTo, { replace: true })
  }

  // Show errors from child forms
  function handleError(message: string) {
    setError(message)
  }

  // After sign-up, move to email verification view
  function handleVerifyEmailRequested(newEmail: string) {
    setEmail(newEmail)
    setView('verifyEmail')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex min-h-screen">
        {/* Marketing panel (desktop only) */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-12">
          <div className="max-w-lg mx-auto text-white space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">K2K Logistics</h1>
            </div>
            <p className="text-lg">
              One-stop platform for all your logistics operations. Book, track,
              and manage shipments—right here.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <span className="text-2xl font-bold">5K+</span>
                </div>
                <div>
                  <h3 className="font-semibold">Active Users</h3>
                  <p className="text-sm">across all branches</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <span className="text-2xl font-bold">1M+</span>
                </div>
                <div>
                  <h3 className="font-semibold">Deliveries</h3>
                  <p className="text-sm">completed this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication forms panel */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
                {error}
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {view === 'signIn' && (
                <SignInForm
                  onSuccess={handleSuccess}
                  onError={handleError}
                  onForgotPassword={() => setView('forgotPassword')}
                  onToggleMode={() => setView('signUp')}
                />
              )}

              {view === 'signUp' && (
                <SignUpForm
                  onSuccess={handleVerifyEmailRequested}
                  onError={handleError}
                  onToggleMode={() => setView('signIn')}
                />
              )}

              {view === 'forgotPassword' && (
                <ForgotPasswordForm
                  onSuccess={() => setView('signIn')}
                  onBack={() => setView('signIn')}
                />
              )}

              {view === 'verifyEmail' && (
                <EmailVerification
                  email={email}
                  onClose={() => setView('signIn')}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
