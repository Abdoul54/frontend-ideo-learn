'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    TextField,
    IconButton,
    InputAdornment,
    Checkbox,
    Button,
    FormControlLabel,
    Alert,
    Card,
    CardContent,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/api/useAuth'
import { useSettings } from '@/@core/contexts/settingsContext'
import centralChecker from '@/utils/workers/centralChecker'
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import Background from '../Background'

const CentralLogin = () => {
    const [isPasswordShown, setIsPasswordShown] = useState(false)
    const { settings, isLoading: isConfigLoading } = useSettings()
    const router = useRouter()
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            username: '',
            password: '',
            issue_refresh_token: false
        }
    })

    const { signIn, isLoading: isAuthLoading, error: authError } = useAuth({
        onSuccess: () => {
            window.location.replace('/dashboard') ;
        }
    })

    const handleClickShowPassword = () => setIsPasswordShown(prev => !prev)
    const onSubmit = async (data) => signIn({
        username: data.username,
        password: data.password,
        issue_refresh_token: Boolean(data.issue_refresh_token)
    })

    const socialButtons = [
        { icon: 'ri-facebook-fill', className: 'text-blue-600 hover:text-blue-700', ariaLabel: 'Login with Facebook' },
        { icon: 'ri-twitter-fill', className: 'text-sky-500 hover:text-sky-600', ariaLabel: 'Login with Twitter' },
        { icon: 'ri-github-fill', className: 'text-gray-800 hover:text-gray-900', ariaLabel: 'Login with GitHub' },
        { icon: 'ri-google-fill', className: 'text-red-500 hover:text-red-600', ariaLabel: 'Login with Google' }
    ]

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
                    alt: 'Login background',
                    loop: true,
                    type: 'video/*'
                }}
                imageConfig={{
                    src: settings?.sign_in?.bg_data,
                    alt: 'Login background'
                }}
            />

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md overflow-hidden rounded-xl bg-white/95 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:shadow-xl">
                    <div className="flex justify-center pt-8">
                        <Logo className="h-12 w-auto transition-transform duration-300 hover:scale-105" />
                    </div>

                    <CardContent className="p-8" component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>

                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold text-gray-900">{settings?.header?.page_title}</h2>
                            {settings?.header?.header_message?.status === 'enabled' && (<p className="mt-2 text-gray-600">{settings?.header?.header_message?.content}</p>)}
                        </div>

                        {(authError) && (
                            <Alert
                                severity="error"
                                className="mb-6 rounded-lg border-0 bg-red-50"
                            >
                                {authError?.message}
                            </Alert>
                        )}

                        <div className="space-y-6">
                            <Controller
                                name="username"
                                control={control}
                                rules={{ required: 'Username is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Username"
                                        variant="outlined"
                                        disabled={isAuthLoading}
                                        error={Boolean(errors.username)}
                                        helperText={errors.username?.message}
                                        className="rounded-lg bg-white/50 transition-all duration-300 hover:bg-white"
                                    />
                                )}
                            />

                            <Controller
                                name="password"
                                control={control}
                                rules={{
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters'
                                    }
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Password"
                                        type={isPasswordShown ? 'text' : 'password'}
                                        variant="outlined"
                                        disabled={isAuthLoading}
                                        error={Boolean(errors.password)}
                                        helperText={errors.password?.message}
                                        className="rounded-lg bg-white/50 transition-all duration-300 hover:bg-white"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                        size="large"
                                                        className="transition-colors duration-300 hover:text-primary"
                                                        aria-label={isPasswordShown ? 'Hide password' : 'Show password'}
                                                    >
                                                        <i className={`${isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-500`} />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                )}
                            />

                            <div className="flex items-center justify-between">
                                <Controller
                                    name="issue_refresh_token"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    {...field}
                                                    checked={field.value}
                                                    color="primary"
                                                    className="text-primary"
                                                />
                                            }
                                            label={<span className="text-sm">Remember me</span>}
                                            disabled={isAuthLoading}
                                        />
                                    )}
                                />
                            </div>

                            <Button
                                fullWidth
                                variant="contained"
                                type="submit"
                                disabled={isAuthLoading}
                                className="relative h-12 overflow-hidden rounded-lg bg-primary text-base font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-primary/90 disabled:bg-gray-300"
                            >
                                {isAuthLoading ? (
                                    <i className="svg-spinners-3-dots-fade text-white text-2xl" />
                                ) : (
                                    'Sign in'
                                )}
                            </Button>
                            {/* <Button
                                fullWidth
                                variant="contained"
                                type='button'
                                onClick={() => console.log('SAML Sign in')}
                                disabled={isAuthLoading}
                                className="relative h-12 overflow-hidden rounded-lg bg-primary text-base font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-primary/90 disabled:bg-gray-300"
                            >
                                {isAuthLoading ? (
                                    <i className="svg-spinners-3-dots-fade text-white text-2xl" />
                                ) : (
                                    'SAML Sign in'
                                )}
                            </Button> */}
                        </div>

                        {/* For Future integration */}
                        {/* 
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-4 text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-center gap-4">
                                {socialButtons.map((button, index) => (
                                    <IconButton
                                        key={index}
                                        className={`${button.className} transform transition-all duration-300 hover:scale-110 hover:shadow-lg`}
                                        aria-label={button.ariaLabel}
                                    >
                                        <i className={`${button.icon} text-2xl`} />
                                    </IconButton>
                                ))}
                            </div>
                        </div>
*/}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default CentralLogin