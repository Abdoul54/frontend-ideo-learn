'use client'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box
} from '@mui/material'
import { useSettings } from '@/@core/contexts/settingsContext'
import Logo from '@components/layout/shared/Logo'
import Background from './Background'
import { useRouter } from 'next/navigation'

const SSO = ({ error, isLoading, success }) => {
  const { settings, isLoading: isConfigLoading } = useSettings()
  const router = useRouter()

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
        }}
        imageConfig={{
          src: settings?.sign_in?.bg_data,
          alt: 'Reset password background'
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card
          sx={{
            width: '100%',
            maxWidth: '400px',
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              transform: 'translateY(-2px)'
            },
            margin: 'auto'
          }}
        >
          <div className="flex justify-center pt-8">
            <Logo />
          </div>

          <CardHeader title="Single Sign-On" sx={{
            textAlign: 'center',
            fontWeight: 600,
            color: 'text.primary',
            padding: 1
          }} />

          <CardContent className="p-8">
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              minHeight: '160px',
              padding: theme => theme.spacing(2)
            }}>
              {isLoading && (
                <>
                  <i className='svg-spinners-90-ring text-7xl mb-4 text-primary' />
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      textAlign: 'center',
                      fontSize: '1.05rem',
                      fontWeight: 500
                    }}
                  >
                    Please wait while we authenticate you...
                  </Typography>
                </>
              )}
              {error && (
                <>
                  <i className='solar-close-circle-line-duotone text-8xl text-error' />

                  <Typography
                    variant="subtitle1"
                    color="error.main"
                    sx={{
                      textAlign: 'center',
                      fontWeight: 600
                    }}
                  >
                    Authentication Failed
                  </Typography>


                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      textAlign: 'center',
                      border: 1,
                      borderColor: 'error.main',
                      borderRadius: 1,
                      padding: 1,
                      fontWeight: 500,
                      color: 'error.main'
                    }}
                  >
                    {error}
                  </Typography>

                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 3 }}
                    onClick={() => router.push('/login')}
                  >
                    Return to Login
                  </Button>
                </>
              )}
              {success && (
                <>
                  <i className='solar-check-circle-line-duotone text-8xl mb-4 text-success' />
                  <Typography
                    variant="subtitle1"
                    color="success.main"
                    sx={{
                      textAlign: 'center',
                      fontWeight: 600,
                      mb: 1
                    }}
                  >
                    Authentication Successful
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      textAlign: 'center'
                    }}
                  >
                    You will be redirected momentarily...
                  </Typography>

                  {/* Loading indicator */}
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='svg-spinners-3-dots-fade text-lg text-primary' />
                  </Box>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SSO