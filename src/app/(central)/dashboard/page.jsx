"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Stack,
  MenuItem,
  Select,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Pagination,
  PaginationItem,
} from "@mui/material";
import { useMoveTenantDown, useMoveTenantUp, useTenant } from "@/hooks/api/central/useTenant";
import { useDebounce } from "react-use";
import TenantCard from "@/components/cards/tenantCards";

// Confirmation Dialog Component
const ConfirmDialog = ({ open, onClose, onConfirm, title, message, tenantName }) => {
  const [inputValue, setInputValue] = useState("");

  const handleConfirm = () => {
    if (inputValue === tenantName) {
      onConfirm();
      setInputValue("");
    }
  };

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
        <TextField
          label="Enter tenant name"
          fullWidth
          margin="normal"
          variant="outlined"
          autoFocus
          required
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Type "${tenantName}" to confirm`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          disabled={inputValue !== tenantName}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};


// Skeleton Loader Component
const TenantCardSkeleton = () => (
  <Grid item xs={12} sm={6} md={4}>
    <Card className="h-44 rounded-lg">
      <CardContent>
        <Stack spacing={2}>
          <div className="h-8 w-3/5 bg-gray-200 rounded animate-pulse" />
          <div className="flex space-x-2">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-2/5 bg-gray-200 rounded animate-pulse" />
          <div className="flex justify-between">
            <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </Stack>
      </CardContent>
    </Card>
  </Grid>
);

const TenantDashboard = () => {

  const [filters, setFilters] = useState({ status: "all", search: "" });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    tenant: null,
    action: null,
    title: "",
    message: "",
    tenantName: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 8,
    total: 0,
    last_page: 1,
    has_more: false
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useDebounce(
    () => {
      setDebouncedSearch(filters.search);
    },
    500,
    [filters.search]
  );


  const {
    data: tenantsResponse,
    isLoading,
    error,
    isFetching,
  } = useTenant({
    page: pagination.page,
    page_size: pagination.page_size,
    search: debouncedSearch,
  });


  useEffect(() => {
    if (tenantsResponse?.data?.pagination) {
      const {
        total,
        per_page,
        current_page,
        last_page,
        has_more
      } = tenantsResponse.data.pagination;

      setPagination((prev) => ({
        ...prev,
        total,
        page_size: per_page,
        page: current_page,
        last_page,
        has_more,
      }));
    }
  }, [tenantsResponse?.data?.pagination]);

  const tenants = tenantsResponse?.data?.items || [];
  const activeTenants = tenantsResponse?.extra_data?.total_active || 0;
  const totalTenant = tenantsResponse?.data?.pagination?.total || 0;

  const checkSSLStatus = (tenant) => {
    if (!tenant.main_domain?.ssl?.status || tenant.main_domain.ssl.status === "none") {
      return { status: "none", daysLeft: null };
    }
    return { status: tenant.main_domain.ssl.status, daysLeft: null };
  };

  const handlePageChange = (event, newPage) => {
    if (newPage !== pagination.page) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const matchesSearch = tenant.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "enable" && tenant.status === "enable") ||
        (filters.status === "disable" && tenant.status === "disable");
      return matchesSearch && matchesStatus;
    });
  }, [tenants, filters]);

  const sslAlerts = useMemo(() => {
    return filteredTenants.filter((tenant) => {
      const { status } = checkSSLStatus(tenant);
      return status === "expired" || status === "expiring";
    }).length;
  }, [filteredTenants]);

  // Mutations
  const moveTenantUpMutation = useMoveTenantUp();
  const moveTenantDownMutation = useMoveTenantDown();

  const handleStatusToggle = (tenant) => {
    setConfirmDialog({
      open: true,
      tenant,
      action: tenant.status === "enable" ? "down" : "up",
      title: `${tenant.status === "enable" ? "Disable" : "Enable"} Tenant`,
      message: `Are you sure you want to ${tenant.status === "enable" ? "disable" : "enable"} ${tenant.name}?`,
      tenantName: tenant.name,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      tenant: null,
      action: null,
      title: "",
      message: "",
      tenantName: "",
    });
  };

  const handleConfirmAction = () => {
    const { tenant, action } = confirmDialog;

    if (action === "up") {
      moveTenantUpMutation.mutate(tenant.id, {
        onSuccess: () => {
          closeConfirmDialog();
        },
        onError: (error) => {
          console.error("Failed to move tenant up:", error);
        },
      });
    } else if (action === "down") {
      moveTenantDownMutation.mutate(tenant.id, {
        onSuccess: () => {
          closeConfirmDialog();
        },
        onError: (error) => {
          console.error("Failed to move tenant down:", error);
        },
      });
    }
  };


  return (
    <Box className="p-6">
      {/* Header Section */}
      <Box className="mb-8">
        <Typography variant="h4" className="font-bold mb-2">
          Welcome back to Ideo Learn
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your tenants today.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {/* Total Tenants */}
        <div className="rounded-xl p-4 flex items-center gap-4">
          <div className="bg-red-100 p-3 pb-2 rounded-lg">
            <i className="solar-database-bold-duotone w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-gray-600 text-sm">Total Tenants</p>
            <p className="text-red-600 text-2xl font-semibold">{totalTenant}</p>
          </div>
        </div>

        {/* Active Tenants */}
        <div className="rounded-xl p-4 flex items-center gap-4">
          <div className="bg-blue-100 p-3 pb-2 rounded-lg">
            <i className="solar-check-circle-bold-duotone w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-600 text-sm">Active Tenants</p>
            <p className="text-blue-600 text-2xl font-semibold">
              {activeTenants}
            </p>
          </div>
        </div>

        {/* SSL Active */}
        <div className="rounded-xl p-4 flex items-center gap-4">
          <div className="bg-orange-100 p-3 pb-2 rounded-lg">
            <i className="solar-shield-check-bold-duotone w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-gray-600 text-sm">SSL Alert</p>
            <p className="text-orange-600 text-2xl font-semibold">{sslAlerts}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Paper className="p-4 mb-5" elevation={0}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          className="items-center justify-between"
        >
          <TextField
            fullWidth
            placeholder="Search tenants..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" aria-label="search">
                  <i className="ri-search-line" />
                </InputAdornment>
              ),
            }}
            className="max-w-md"
            size="small"
          />
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="min-w-[120px]"
            size="small"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="enable">Active</MenuItem>
            <MenuItem value="disable">Inactive</MenuItem>
          </Select>
        </Stack>
      </Paper>

      {/* Tenants Grid */}
      <Grid container spacing={3}>
        {isLoading ? (
          <TenantCardSkeleton />
        ) : error ? (
          <Grid item xs={12}>
            <Paper className="p-4 text-center text-red-500">
              Error loading tenants
            </Paper>
          </Grid>
        ) : filteredTenants.length === 0 ? (
          <Grid item xs={12} sx={{ textAlign: "center", py: 8 }}>
            <Box sx={{ mb: 3 }}>
              <img
                src="/images/illustrations/characters/no_data_found.svg"
                alt="No tenants found"
                style={{ margin: "auto", height: 350, width: 350 }}
              />
            </Box>
            <Typography variant="h6">No tenants found</Typography>
            <Typography color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Grid>
        ) : (
          filteredTenants.map((tenant) => (
            <Grid item xs={12} sm={6} md={4} key={tenant.id}>
              <TenantCard
                tenant={tenant}
                onStatusToggle={handleStatusToggle}
              />
            </Grid>
          ))
        )}
      </Grid>

      {/*pagination*/}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mt={4}
      >
        <Pagination
          count={pagination.last_page}
          page={pagination.page}
          onChange={handlePageChange}
          color="primary"
          variant="outlined"
          shape="rounded"
          showFirstButton
          showLastButton
          // Disable prev/next buttons based on pagination state
          renderItem={(item) => (
            <PaginationItem
              {...item}
              disabled={
                (item.type === 'previous' && pagination.page === 1) ||
                (item.type === 'next' && !pagination.has_more) ||
                (item.type === 'first' && pagination.page === 1) ||
                (item.type === 'last' && pagination.page === pagination.last_page)
              }
            />
          )}
        />
      </Box>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        tenantName={confirmDialog.tenantName}
      />
    </Box>
  );
};

export default TenantDashboard;
