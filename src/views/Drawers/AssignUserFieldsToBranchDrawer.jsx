'use client'

import { useState, useEffect } from 'react'
import {
  Drawer,
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  FormControlLabel,
  Switch
} from '@mui/material'
import { useUserFieldsassigned } from '@/hooks/api/tenant/useUserFields'
import { useAssignUserFieldsToHaykal } from '@/hooks/api/tenant/useHaykal'
import DataTable from '@/components/datatable/DataTable'

export default function AssignUserFieldsToBranchDrawer({ open, onClose, haykalId }) {
  // State for pagination and sorting
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15
  })
  const [sorting, setSorting] = useState([])
  const [search, setSearch] = useState('')
  const [selectedUserFields, setSelectedUserFields] = useState([])
  const [assignAllFields, setAssignAllFields] = useState(false)

  // Convert API pagination to React Table pagination
  const page = pagination.pageIndex + 1
  const page_size = pagination.pageSize

  // Convert sorting for API
  const sortParams = sorting.map(sort => ({
    id: sort.id,
    desc: sort.desc
  }))

  // Fetch user fields for this specific branch
  const {
    data: userFieldsData,
    isLoading,
    isError,
    error
  } = useUserFieldsassigned(haykalId ? [haykalId] : [], { enabled: open && !!haykalId })

  // Transform the data to include pre-checked status
  const transformedUserFields = userFieldsData ? {
    items: userFieldsData.map(field => ({
      ...field,
      isAssigned: field.visible_for_pu === true
    })),
    pagination: {
      total: userFieldsData.length,
      current_page: 1,
      per_page: userFieldsData.length
    }
  } : { items: [], pagination: { total: 0, current_page: 1, per_page: 15 } }

  // Assign user fields mutation
  const assignUserFieldsMutation = useAssignUserFieldsToHaykal()

  // Set initial selection based on visible_for_pu when data loads
  useEffect(() => {
    if (userFieldsData && open) {
      const initialSelection = userFieldsData
        .filter(field => field.visible_for_pu === true)
        .map(field => ({
          ...field,
          isAssigned: true
        }))

      setSelectedUserFields(initialSelection)
    }
  }, [userFieldsData, open])

  // Reset selection when drawer opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedUserFields([])
      setAssignAllFields(false)
      setSearch('')
      setPagination({
        pageIndex: 0,
        pageSize: 15
      })
      setSorting([])
    }
  }, [open])

  // Handle pagination and sorting changes
  const handlePaginationChange = newPagination => {
    setPagination(newPagination)
  }

  const handleSortingChange = newSorting => {
    setSorting(newSorting)
  }

  // Handle selection changes
  const handleSelectionChange = newSelection => {
    setSelectedUserFields(newSelection)
  }

  // Handle assign button click
  const handleAssign = async () => {
    try {
      if (!haykalId) {
        console.error('No Haykal ID provided')
        return
      }

      // Extract just the IDs for the API
      const userFieldIds = selectedUserFields.map(field => field.id)

      await assignUserFieldsMutation.mutateAsync({
        haykalId,
        userFields: userFieldIds,
        all: assignAllFields
      })

      // Close the drawer on success
      onClose()
    } catch (error) {
      console.error('Error assigning user fields:', error)
    }
  }

  // Define columns for the data table
  const columns = [
    {
      id: 'title',
      header: 'Title',
      cell: ({ row }) => row.original.title,
      flex: 1
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => row.original.type,
      flex: 1
    },
    {
      id: 'mandatory',
      header: 'Mandatory',
      cell: ({ row }) => (row.original.mandatory ? 'Yes' : 'No'),
      flex: 0.7
    },
    // {
    //   id: 'visible_for_pu',
    //   header: 'Currently Assigned',
    //   cell: ({ row }) => (row.original.visible_for_pu ? 'Yes' : 'No'),
    //   flex: 0.7
    // },
    {
      id: 'sequence',
      header: 'Sequence',
      cell: ({ row }) => row.original.sequence,
      flex: 0.7
    }
  ]

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 600 },
          p: 3
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Assign User Fields to Branch
        </Typography>

        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={assignAllFields}
                onChange={(e) => setAssignAllFields(e.target.checked)}
              />
            }
            label="Assign all user fields"
          />
        </Box>

        <Box sx={{ flexGrow: 1, mb: 3 }}>
          <DataTable
            data={transformedUserFields.items || []}
            totalRows={transformedUserFields.pagination?.total || 0}
            columns={columns}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPaginationChange={handlePaginationChange}
            sorting={sorting}
            onSortingChange={handleSortingChange}
            isLoading={isLoading}
            isError={isError}
            error={error}
            selectedRows={selectedUserFields}
            enableSelection={true}
            onRowSelectionChange={handleSelectionChange}
            height="calc(100vh - 180px)"
            emptyStateProps={{
              height: 'calc(100vh - 336px)',
              message: 'No user fields available',
              description: 'No user fields were found matching your criteria'
            }}
          />
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={
              assignUserFieldsMutation.isPending ||
              (!assignAllFields && selectedUserFields.length === 0)
            }
          >
            {assignUserFieldsMutation.isPending ? (
              <CircularProgress size={24} sx={{ mr: 1 }} />
            ) : null}
            Assign
          </Button>
        </Stack>
      </Box>
    </Drawer>
  )
}