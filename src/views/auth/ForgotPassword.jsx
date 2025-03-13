'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Alert,
  Card,
  CardContent,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { useSettings } from '@/@core/contexts/settingsContext'
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import Background from './Background'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForgotPassword } from '@/hooks/api/useAuth'
import TextInput from '@/components/inputs/TextInput'

const schema = yup.object({
  email: yup.string().email().required('Email is required')
})

const ForgotPassword = () => {
  const { settings, isLoading: isConfigLoading } = useSettings()
  const router = useRouter()

  const { control, handleSubmit, formState: { errors }, watch, getValues } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
    }
  })

  const sendResetEmail = useForgotPassword()

  const onSubmit = async (data) => {
    sendResetEmail.mutateAsync(data)
  }

  if (isConfigLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <i className='svg-spinners-6-dots-rotate text-2xl' />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Background
        variant={settings?.sign_in?.type}
        color={settings?.sign_in?.type === 'color' ? settings?.sign_in?.color_data : '#111827'}
        videoConfig={{
          src: settings?.sign_in?.bg_video_data?.video,
          poster: settings?.sign_in?.bg_video_data?.fallback_image,
          alt: 'Forgot password background',
          loop: true,
          type: 'video/*'
        }}
        imageConfig={{
          src: settings?.sign_in?.bg_data,
          alt: 'Forgot password background'
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md overflow-hidden rounded-xl bg-white/95 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-center pt-8">
            <Logo className="h-12 w-auto transition-transform duration-300 hover:scale-105" />
          </div>

          <CardContent className="p-8" component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
              <p className="mt-2 text-gray-600">Enter your email address and we'll send you instructions to reset your password</p>
            </div>

            {sendResetEmail?.error && (
              <Alert
                severity="error"
                className="mb-6 rounded-lg border-0 bg-red-50"
              >
                {sendResetEmail?.error?.message || 'Failed to send reset email'}
              </Alert>
            )}

            {sendResetEmail?.isSuccess ? (
              <div className="space-y-6">
                <Alert
                  severity="success"
                  className="mb-6 rounded-lg border-0 bg-green-50"
                >
                  We've sent password recovery instructions to your email. Please check your inbox and follow the instructions.
                </Alert>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => router.push('/login')}
                  className="relative h-12 overflow-hidden rounded-lg border-primary text-primary text-base font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-primary/10"
                >
                  Return to Login
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <TextInput
                  name="email"
                  control={control}
                  label="Email Address"
                  disabled={sendResetEmail.isPending}
                />
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={sendResetEmail.isPending}
                  className="relative h-12 overflow-hidden rounded-lg bg-primary text-base font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-primary/90 disabled:bg-gray-300"
                >
                  {sendResetEmail.isPending ? (
                    <i className="svg-spinners-3-dots-fade text-white text-2xl" />
                  ) : (
                    'Send Recovery Email'
                  )}
                </Button>

                <div className="flex flex-col items-center">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-textPrimary transition-colors duration-300 hover:text-primary/80"
                  >
                    Remember your password? Sign in
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPassword