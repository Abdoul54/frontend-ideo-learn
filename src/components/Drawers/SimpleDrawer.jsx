import React, { useState, useCallback } from 'react'
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
  Typography
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import FieldRenderer from './FieldRenderer'

const SimpleDrawer = ({
  title,
  fields,
  defaultValues,
  schema,
  onSubmit,
  label,
  icon,
  buttonColor = 'primary.main',
  ...props
}) => {
  const [open, setOpen] = useState(false)
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange'
  })

  const handleClose = useCallback(() => {
    setOpen(false)
    form.reset()
  }, [form])

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data)
      handleClose()
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
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: '500px',
            maxWidth: '90vw'
          }
        }}
      >
        <FormProvider {...form}>
          <Card
            component="form"
            onSubmit={form.handleSubmit(handleSubmit)}
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <CardHeader
              title={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{title}</Typography>
                  <IconButton onClick={handleClose} size="small">
                    <i className="lucide-x" />
                  </IconButton>
                </Box>
              }
            />

            <CardContent sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <Grid container spacing={2}>
                {fields?.map((field, index) => (
                  <Grid item xs={field.grid || 12} key={index}>
                    <FieldRenderer
                      field={field}
                      control={form.control}
                      errors={form.formState.errors}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>

            <CardActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Stack direction="row" spacing={2} sx={{ ml: 'auto' }}>
                <Button variant="outlined" onClick={handleClose}>
                  Cancel
                </Button>
                <LoadingButton
                  variant="contained"
                  type="submit"
                  loading={form.formState.isSubmitting}
                >
                  Save
                </LoadingButton>
              </Stack>
            </CardActions>
          </Card>
        </FormProvider>
      </Drawer>
    </>
  )
}

export default SimpleDrawer