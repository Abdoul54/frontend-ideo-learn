'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconButton,
  InputAdornment,
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
import TextInput from '@/components/inputs/TextInput'
import { useResetPassword } from '@/hooks/api/useAuth'
import { useAdvancedSettings } from '@/@core/contexts/advancedSettingsContext'

// Dynamic schema based on settings
const getPasswordSchema = (settings) => {
  // Get password settings or use defaults
  const passMinChar = settings?.password?.pass_min_char || 8
  const passAlphaNumeric = settings?.password?.pass_alpha_numeric || false

  let passwordSchema = yup.string()
    .required('New password is required')
    .min(passMinChar, `Password must be at least ${passMinChar} characters`)

  // Add alphanumeric validation if required
  if (passAlphaNumeric) {
    passwordSchema = passwordSchema.matches(
      /^(?=.*[a-zA-Z])(?=.*\d).+$/,
      'Password must contain both letters and numbers'
    )
  }

  return yup.object({
    password: passwordSchema,
    password_confirmation: yup.string()
      .required('Confirm password is required')
      .oneOf([yup.ref('password')], 'Passwords do not match')
  })
}

const ResetPassword = ({ email, token }) => {
  const [isNewPasswordShown, setIsNewPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const { settings, isLoading: isConfigLoading } = useSettings()
  const { advancedSettings } = useAdvancedSettings()
  const router = useRouter()

  // Create dynamic schema based on settings
  const validationSchema = getPasswordSchema(advancedSettings?.password)

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: email,
      password: '',
      password_confirmation: '',
    }
  })

  const resetPassword = useResetPassword()

  const handleClickShowNewPassword = () => setIsNewPasswordShown(prev => !prev)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(prev => !prev)

  const onSubmit = async (data) => {
    resetPassword.mutateAsync({
      token,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation
    }).then(() => {
      // Success is handled by the success state
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    })
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
          alt: 'Reset password background',
          loop: true,
          type: 'video/*'
        }}
        imageConfig={{
          src: settings?.sign_in?.bg_data,
          alt: 'Reset password background'
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md overflow-hidden rounded-xl bg-white/95 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-center pt-8">
            <Logo className="h-12 w-auto transition-transform duration-300 hover:scale-105" />
          </div>

          <CardContent className="p-8" component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
              <p className="mt-2 text-gray-600">Enter your new password below</p>
              <p className="mt-1 text-sm text-gray-500">
                Password must be at least {settings?.password?.pass_min_char || 8} characters
                {settings?.password?.pass_alpha_numeric && " and contain both letters and numbers"}
              </p>
            </div>

            {resetPassword?.error && (
              <Alert
                severity="error"
                className="mb-6 rounded-lg border-0 bg-red-50"
              >
                {resetPassword?.error?.message || 'Failed to reset password. Please try again.'}
              </Alert>
            )}

            {resetPassword?.isSuccess && (
              <Alert
                severity="success"
                className="mb-6 rounded-lg border-0 bg-green-50"
              >
                Password reset successful! Redirecting to login...
              </Alert>
            )}

            {(!token || !email) && (
              <Alert
                severity="error"
                className="mb-6 rounded-lg border-0 bg-red-50"
              >
                Invalid or missing reset token. Please request a new password reset link.
              </Alert>
            )}

            <div className="space-y-6">
              <TextInput
                control={control}
                label='Email'
                name='email'
                disabled={resetPassword.isPending}
                InputProps={{
                  readOnly: true
                }}
              />
              <TextInput
                control={control}
                label='Password'
                name='password'
                type={isNewPasswordShown ? 'text' : 'password'}
                disabled={resetPassword.isPending}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowNewPassword}
                        edge="end"
                        size="large"
                        className="transition-colors duration-300 hover:text-primary"
                        aria-label={isNewPasswordShown ? 'Hide password' : 'Show password'}
                        disabled={resetPassword.isPending || resetPassword.isSuccess || !token || !email}
                      >
                        <i className={`${isNewPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-500`} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextInput
                control={control}
                label='Confirm Password'
                name='password_confirmation'
                type={isConfirmPasswordShown ? 'text' : 'password'}
                disabled={resetPassword.isPending}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                        size="large"
                        className="transition-colors duration-300 hover:text-primary"
                        aria-label={isConfirmPasswordShown ? 'Hide password' : 'Show password'}
                        disabled={resetPassword.isPending || resetPassword.isSuccess || !token || !email}
                      >
                        <i className={`${isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-500`} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={resetPassword.isPending || resetPassword.isSuccess || !token || !email}
                className="relative h-12 overflow-hidden rounded-lg bg-primary text-base font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-primary/90 disabled:bg-gray-300"
              >
                {resetPassword.isPending ? (
                  <i className="svg-spinners-3-dots-fade text-white text-2xl" />
                ) : (
                  'Reset Password'
                )}
              </Button>

              <div className="mt-4 text-center">
                <Link
                  href="/login"
                  className="text-sm font-medium text-primary transition-colors duration-300 hover:text-primary/80"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword