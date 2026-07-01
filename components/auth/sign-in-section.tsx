'use client'

import { useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { GoogleSignInButton } from './google-sign-in-button'

// Maps NextAuth v5 error codes to user-friendly messages.
// Full list: https://authjs.dev/reference/core/errors
const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: 'Could not start the Google sign-in process. Please try again.',
  OAuthCallback: 'An error occurred returning from Google. Please try again.',
  OAuthCreateAccount: 'Could not create your account. Please try again.',
  OAuthAccountNotLinked: 'This email is already linked to another sign-in method.',
  Callback: 'Authentication callback failed. Please try again.',
  AccessDenied: 'Access was denied. Make sure to allow the required Google permissions.',
  Configuration: 'Auth is misconfigured. Please contact the site administrator.',
  Default: 'Something went wrong during sign-in. Please try again.',
}

export function SignInSection() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error')
  const errorMessage = errorCode
    ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default)
    : null

  return (
    <div className="flex flex-col gap-4">
      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <GoogleSignInButton />

      <p className="text-center text-xs text-gray-400">
        By continuing, you agree to our{' '}
        <a href="#" className="underline underline-offset-2 hover:text-gray-600">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="underline underline-offset-2 hover:text-gray-600">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}
