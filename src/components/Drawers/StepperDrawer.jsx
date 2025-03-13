import React, { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import FieldRenderer from './FieldRenderer'


const StepperDrawer = ({
  title,
  steps,
  icon,
  buttonColor = 'primary.main',
  label,
  defaultValues,
  schema,
  onSubmit
}) => {
  const [open, setOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange'
  })

  const handleNext = async () => {
    const fields = steps[activeStep]?.sections
      ?.flatMap(s => s?.fields?.map(f => f.name))
      ?.filter(Boolean) || []

    if (fields.length === 0 || await form.trigger(fields)) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data)
      setOpen(false)
      setActiveStep(0)
      form.reset()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        startIcon={icon && <i className={icon} />}
        sx={{ bgcolor: buttonColor }}
      >
        {label}
      </Button>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: '60%', maxWidth: '95vw' }
        }}
      >
        <FormProvider {...form}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title={title}
              action={
                <IconButton onClick={() => setOpen(false)}>
                  <i className="lucide-x" />
                </IconButton>
              }
            />

            <CardContent sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <Box sx={{ mb: 4 }}>
                <Stepper activeStep={activeStep}>
                  {steps.map((step, index) => (
                    <Step key={index}>
                      <StepLabel>{step.label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {steps[activeStep]?.sections?.map((section, idx) => (
                <Box key={idx} sx={{ mb: 4 }}>
                  {section.label && (
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {section.label}
                    </Typography>
                  )}
                  <Grid container spacing={2}>
                    {section.fields?.map((field, fieldIdx) => (
                      <Grid item xs={field.grid || 6} key={fieldIdx}>
                        <FieldRenderer
                          field={field}
                          control={form.control}
                          errors={form.formState.errors}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </CardContent>

            <CardActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Stack direction="row" spacing={2} sx={{ ml: 'auto' }}>
                {activeStep > 0 && (
                  <Button onClick={() => setActiveStep(prev => prev - 1)}>
                    Back
                  </Button>
                )}
                <LoadingButton
                  variant="contained"
                  loading={form.formState.isSubmitting}
                  onClick={
                    activeStep === steps.length - 1
                      ? form.handleSubmit(handleSubmit)
                      : handleNext
                  }
                >
                  {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                </LoadingButton>
              </Stack>
            </CardActions>
          </Card>
        </FormProvider>
      </Drawer>
    </>
  )
}

export default StepperDrawer