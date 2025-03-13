"use client";

import { useState } from "react";
import { useAddTenant, useMoveTenantDown, useMoveTenantUp, useTenant } from "@/hooks/api/central/useTenant";
import DataView from "@/views/DataView";
import TenantForm from "@/views/Forms/Tenant/TenantForm";
import { columns } from "@/constants/TenantManagement";

const Page = () => {
  const [filters, setFilters] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  const [columnVisibility, setColumnVisibility] = useState({});

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch tenant data
  const { data, isLoading, error } = useTenant({
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    search: globalFilter,
    sort: sorting,
    filters,
  });

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageIndex: newPage }));
  };

  return (
    <>
      <DataView
        title="Tenant Management"
        columns={columns}
        data={data?.data?.items || []}
        isLoading={isLoading}
        height="calc(100vh - 253px)"
        error={error}
        pagination={{
          currentPage: pagination.pageIndex,
          totalPages: data?.data?.pagination?.last_page || 1,
          onPageChange: handlePageChange,
          pageSize: pagination.pageSize,
          onPageSizeChange: (newPageSize) =>
            setPagination({ ...pagination, pageSize: newPageSize }),
          total: data?.data?.pagination?.total || 0,
        }}
        setPagination={handlePageChange}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        toolbar={{
          breadcrumbs: [{ label: "Tenant Management" }],
          buttonGroup: [
            {
              text: "Add Tenant",
              variant: "contained",
              tooltip: "Create a new tenant",
              icon: "lucide-plus",
              onClick: () => setIsDrawerOpen(true),
            },
          ],
        }}
        slots={{
          filters,
          setFilters,
          globalFilter,
          setGlobalFilter,
          sorting,
          setSorting,
          columnVisibility,
          setColumnVisibility,
          features: {
            search: true,
            filter: false,
            navigation: false,
            columnVisibility: true,
            breadcrumbs: true,
          },
          emptyState: {
            height: "calc(100vh - 408px)",
            message: "No tenants found",
            description: "Try adjusting your filters or adding a new tenant.",
          },
        }}
      />
      {/* Tenant Drawer */}
      <TenantForm open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};

export default Page;