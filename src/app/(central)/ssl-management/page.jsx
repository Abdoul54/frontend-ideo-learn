"use client";

import { useState } from "react";
import { columns } from "@/constants/columns/SSL";
import DataView from "@/views/DataView";
import { useSSL } from "@/hooks/api/central/useSSL";

const Page = () => {
  const [filters, setFilters] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  // Fetch SSL data
  const { data, isLoading, error } = useSSL({
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    search: globalFilter,
    sort: sorting,
    filters,
  });

  const items = data?.data?.items || [];

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageIndex: newPage }));
  };

  return (
    <DataView
      title="SSL Management"
      columns={columns}
      data={items}
      height="calc(100vh - 253px)"
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
      setSelectedRows={setSelectedRows}
      toolbar={{
        breadcrumbs: [{ label: "SSL Management" }],
        buttonGroup: [
          {
            text: "Add SSL",
            variant: "contained",
            tooltip: "Create a new SSL",
            icon: "lucide-plus",
            onClick: () => console.log("Creating SSL"),
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
          message: "No SSL found",
          description: "Try adjusting your filters or adding a new SSL.",
        },
      }}
    />
  );
};

export default Page;