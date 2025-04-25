import { useState } from "react";
import { Controller } from "react-hook-form";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Paper,
  InputAdornment,
  IconButton
} from "@mui/material";
import DataView from "@/views/DataView";
import { useGroups } from "@/hooks/api/tenant/useGroups";

export default function SelectGroupsStep({ control, errors, setValue }) {
  // Pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  
  // Fetch groups data
  const { data: groupsData, isLoading } = useGroups({
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    search: search,
    sort_attr: sorting[0]?.id || 'name',
    sort_dir: sorting[0]?.desc ? 'desc' : 'asc',
  });

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  // Columns for the groups data table
  const columns = [
    { accessorKey: 'name', header: 'Name', flex: 1 },
    { accessorKey: 'description', header: 'Description', flex: 1 },
    { 
      accessorKey: 'type', 
      header: 'Type', 
      cell: ({ row }) => (
        <Box>
          {row.original.type === 'automatic' ? 
            <span style={{ color: 'blue' }}>Automatic</span> : 
            <span style={{ color: 'green' }}>Manual</span>
          }
        </Box>
      )
    }
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Select Groups
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select groups to enroll all their members in the selected courses
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 0, height: '450px' }}>
          <Controller
            name="group_ids"
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <DataView
                title=""
                columns={columns}
                data={groupsData?.items || []}
                isLoading={isLoading}
                error={null}
                enableSelection
                pagination={{
                  pageIndex: pagination.pageIndex,
                  pageSize: pagination.pageSize,
                  total: groupsData?.pagination?.total || 0
                }}
                setPagination={setPagination}
                selectedRows={groupsData?.items?.filter(group => 
                  field.value.includes(group.id)
                ) || []}
                setSelectedRows={(selectedGroups) => {
                  field.onChange(selectedGroups.map(group => group.id));
                  setValue('group_ids', selectedGroups.map(group => group.id));
                }}
                slots={{
                  globalFilter: search,
                  setGlobalFilter: handleSearchChange,
                  sorting,
                  setSorting,
                  columnVisibility,
                  setColumnVisibility,
                  features: {
                    search: true,
                    filter: false,
                    columnVisibility: false
                  }
                }}
                getRowId={(row) => row.id}
                height="calc(100% - 56px)"
              />
            )}
          />
        </Paper>
      </Grid>

      {errors.group_ids && (
        <Grid item xs={12}>
          <Typography color="error">{errors.group_ids.message}</Typography>
        </Grid>
      )}
    </Grid>
  );
}