"use client";

import { useMemo, useState } from "react";
import { columns } from "@/constants/columns/CustomDomain";
import DataView from "@/views/DataView";
import { useCustomDomain } from "@/hooks/api/central/useCustomDomain";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import CustomDomainForm from "@/views/Forms/CustomDomainForm";

const Page = () => {
  const [filters, setFilters] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch custom domain data
  const { data, isLoading, error, refetch } = useCustomDomain({
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    search: globalFilter,
    sort: sorting,
    filters,
  });

  const handleSubmitSuccess = () => {
    refetch();
  };

  const items = data?.data?.items || [];

  const tableConfig = useMemo(() => ({
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
      message: "No custom domains found",
      description: "Try adjusting your filters or adding a new custom domain."
    }
  }), [filters, globalFilter, sorting, columnVisibility]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageIndex: newPage }));
  };

  return (
    <>
      <DataView
        title="Custom Domain Management"
        columns={columns}
        height="calc(100vh - 253px)"
        data={items}
        isLoading={isLoading}
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
        onSelectedRowsChange={setSelectedRows}
        toolbar={{
          breadcrumbs: [{ label: "Custom Domain Management" }],
          buttonGroup: [
            {
              text: "Add Custom Domain",
              variant: "contained",
              tooltip: "Create a new custom domain",
              icon: "lucide-plus",
              onClick: () => setIsDrawerOpen(true),
            },
          ],
        }}
        slots={tableConfig}
      />
      {/* Custom Domain Drawer */}
      <DrawerFormContainer
        title="Add Custom Domain"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        description="Add a new custom domain to your tenant."
      >
        <CustomDomainForm
          onCancel={() => setIsDrawerOpen(false)}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </DrawerFormContainer>
    </>
  );
};

export default Page;
