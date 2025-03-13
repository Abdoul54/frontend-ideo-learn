'use client'

import { useRouter } from 'next/navigation'
import NotFound404 from '@/components/illustrations/NotFound'
import {
  Box,
  Typography,
  Button,
  Container,
  Stack
} from '@mui/material'
import { useEffect, useState } from 'react'
import centralChecker from '@/utils/workers/centralChecker'

const NotFound = () => {
  const router = useRouter()

  const [isCentral, setIsCentral] = useState(null)

  useEffect(() => {
    const checkCentral = async () => {
      try {
        const centralCheck = await centralChecker()
        setIsCentral(centralCheck)
      } catch (error) {
        console.error('Central check failed:', error)
      }
    }
    checkCentral()
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        p: 3,
        background: 'linear-gradient(to bottom, var(--mui-palette-background-default), var(--mui-palette-background-paper))'
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Box sx={{ width: '100%', maxWidth: 350, mx: 'auto' }}>
            <NotFound404 width="100%" height="auto" />
          </Box>

          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Page not found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sorry, we couldn't find the page you're looking for.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mt: 2 }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={isCentral === null}
              onClick={() => router.push(isCentral ? '/dashboard' : '/home')}
            >
              Back to Home
            </Button>

            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

export default NotFound