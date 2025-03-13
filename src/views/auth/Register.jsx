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
import CheckboxInput from '@/components/inputs/CheckboxInput'
import { useRegister } from '@/hooks/api/useAuth'
import { useAdvancedSettings } from '@/@core/contexts/advancedSettingsContext'

// Dynamic schema based on settings
const getRegistrationSchema = (settings) => {
    // Get password settings or use defaults
    const passMinChar = settings?.password?.pass_min_char || 8
    const passAlphaNumeric = settings?.password?.pass_alpha_numeric || false
    const passNotUsername = settings?.password?.pass_not_username || false
    const requiresTerms = settings?.user?.terms_and_conditions || false
    const requiresPrivacy = settings?.user?.privacy_policy || false
    const useEmailAsUsername = settings?.user?.use_email_as_username || false

    let passwordSchema = yup.string()
        .required('Password is required')
        .min(passMinChar, `Password must be at least ${passMinChar} characters`)

    // Add alphanumeric validation if required
    if (passAlphaNumeric) {
        passwordSchema = passwordSchema.matches(
            /^(?=.*[a-zA-Z])(?=.*\d).+$/,
            'Password must contain both letters and numbers'
        )
    }

    // Build the schema object
    const schemaObj = {
        email: yup.string()
            .required('Email is required')
            .email('Must be a valid email'),
        password: passwordSchema,
        password_confirmation: yup.string()
            .required('Confirm password is required')
            .oneOf([yup.ref('password')], 'Passwords do not match')
    }

    // Add username validation if not using email as username
    if (!useEmailAsUsername) {
        schemaObj.username = yup.string()
            .required('Username is required')
            .min(2, 'Username must be at least 2 characters')

        // Add password not same as username validation if required
        if (passNotUsername) {
            passwordSchema = passwordSchema.test(
                'not-username',
                'Password cannot be the same as your username',
                function (value) {
                    return value !== this.parent.username;
                }
            )
        }
    }

    // Add first/last name validations if required
    if (settings?.register?.last_first_modatory) {
        schemaObj.first_name = yup.string().required('First name is required');
        schemaObj.last_name = yup.string().required('Last name is required');
    } else {
        schemaObj.first_name = yup.string();
        schemaObj.last_name = yup.string();
    }

    // Add terms and privacy validations if required
    if (requiresTerms) {
        schemaObj.terms_accepted = yup.boolean()
            .oneOf([true], 'You must accept the terms and conditions')
    }

    if (requiresPrivacy) {
        schemaObj.privacy_accepted = yup.boolean()
            .oneOf([true], 'You must accept the privacy policy')
    }

    return yup.object(schemaObj)
}

const Register = () => {
    const [isPasswordShown, setIsPasswordShown] = useState(false)
    const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
    const { settings, isLoading: isConfigLoading } = useSettings()
    const { advancedSettings } = useAdvancedSettings()
    const router = useRouter()

    // Create dynamic schema based on settings
    const validationSchema = getRegistrationSchema(advancedSettings)

    const { control, handleSubmit } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            email: "",
            first_name: "",
            last_name: "",
            password: "",
            password_confirmation: "",
            privacy_accepted: false,
            terms_accepted: false,
            username: ""
        }
    })

    const register = useRegister()

    const handleClickShowPassword = () => setIsPasswordShown(prev => !prev)
    const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(prev => !prev)

    const onSubmit = async (data) => {
        const payload = {
            email: data.email,
            password: data.password,
            password_confirmation: data.password_confirmation,
            first_name: data.first_name,
            last_name: data.last_name
        };

        // Add username if not using email as username
        if (!advancedSettings?.user?.use_email_as_username) {
            payload.username = data.username;
        }

        // Add terms and privacy acceptances if required
        if (advancedSettings?.user?.terms_and_conditions) {
            payload.terms_accepted = data.terms_accepted;
        }

        if (advancedSettings?.user?.privacy_policy) {
            payload.privacy_accepted = data.privacy_accepted;
        }

        register.mutateAsync(payload).then(() => {
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
                    alt: 'Registration background',
                    loop: true,
                    type: 'video/*'
                }}
                imageConfig={{
                    src: settings?.sign_in?.bg_data,
                    alt: 'Registration background'
                }}
            />

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <Card className="w-full max-w-xl overflow-hidden rounded-xl bg-white/95 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:shadow-xl">
                    <div className="flex justify-center pt-8">
                        <Logo className="h-12 w-auto transition-transform duration-300 hover:scale-105" />
                    </div>

                    <CardContent className="p-8" component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
                            <p className="mt-2 text-gray-600">Join us and get started today</p>
                        </div>

                        {register?.error && (
                            <Alert
                                severity="error"
                                className="mb-6 rounded-lg border-0 bg-red-50"
                            >
                                {register?.error?.message || 'Registration failed. Please try again.'}
                            </Alert>
                        )}

                        {register?.isSuccess && (
                            <Alert
                                severity="success"
                                className="mb-6 rounded-lg border-0 bg-green-50"
                            >
                                {
                                    advancedSettings?.register?.disable_registration_email_confirrmation
                                        ? 'Registration successful! Please check your email to verify your account. Redirecting to login...'
                                        : 'Registration successful! Redirecting to login...'
                                }
                            </Alert>
                        )}

                        <div className="space-y-6">
                            {!advancedSettings?.user?.use_email_as_username && (
                                <TextInput
                                    control={control}
                                    label='Username'
                                    name='username'
                                    disabled={register.isPending}
                                    autoFocus
                                />
                            )}

                            <TextInput
                                control={control}
                                label='Email'
                                name='email'
                                type='email'
                                disabled={register.isPending}
                                autoFocus={advancedSettings?.user?.use_email_as_username}
                            />

                            {/* First and Last Name fields */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <TextInput
                                    control={control}
                                    label='First Name'
                                    name='first_name'
                                    disabled={register.isPending}
                                />
                                <TextInput
                                    control={control}
                                    label='Last Name'
                                    name='last_name'
                                    disabled={register.isPending}
                                />
                            </div>

                            <TextInput
                                control={control}
                                label='Password'
                                name='password'
                                type={isPasswordShown ? 'text' : 'password'}
                                disabled={register.isPending}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleClickShowPassword}
                                                edge="end"
                                                size="large"
                                                className="transition-colors duration-300 hover:text-primary"
                                                aria-label={isPasswordShown ? 'Hide password' : 'Show password'}
                                                disabled={register.isPending || register.isSuccess}
                                            >
                                                <i className={`${isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-500`} />
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
                                disabled={register.isPending}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleClickShowConfirmPassword}
                                                edge="end"
                                                size="large"
                                                className="transition-colors duration-300 hover:text-primary"
                                                aria-label={isConfirmPasswordShown ? 'Hide password' : 'Show password'}
                                                disabled={register.isPending || register.isSuccess}
                                            >
                                                <i className={`${isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-500`} />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <div className="flex flex-col items-start">
                                {advancedSettings?.user?.terms_and_conditions && (
                                    <CheckboxInput
                                        control={control}
                                        name='terms_accepted'
                                        label={<>
                                            I agree to the <Link href="/terms" className="font-medium text-primary">Terms of Service</Link>
                                        </>}
                                        disabled={register.isPending}
                                    />
                                )}

                                {advancedSettings?.user?.privacy_policy && (
                                    <CheckboxInput
                                        control={control}
                                        name='privacy_accepted'
                                        label={<>
                                            I agree to the <Link href="/privacy" className="font-medium text-primary">Privacy Policy</Link>
                                        </>}
                                        disabled={register.isPending}
                                    />
                                )}
                            </div>

                            <Button
                                fullWidth
                                variant="contained"
                                type="submit"
                                disabled={register.isPending || register.isSuccess}
                                className="relative h-12 overflow-hidden rounded-lg bg-primary text-base font-semibold uppercase tracking-wider transition-all duration-300 hover:bg-primary/90 disabled:bg-gray-300"
                            >
                                {register.isPending ? (
                                    <i className="svg-spinners-3-dots-fade text-white text-2xl" />
                                ) : (
                                    'Create Account'
                                )}
                            </Button>

                            <div className="mt-4 text-center">
                                <span className="text-sm text-gray-600">Already have an account? </span>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-primary transition-colors duration-300 hover:text-primary/80"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Register