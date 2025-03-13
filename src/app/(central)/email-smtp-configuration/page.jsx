"use client";

import { useState } from "react";
import { columns } from "@/constants/columns/EmailSMTP";
import { useEmailSMTP } from "@/hooks/api/useEmailSMTP";
import DataView from "@/views/DataView";

const Page = () => {
  const [filters, setFilters] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  // Fetch SMTP data
  const { data, isLoading, error } = useEmailSMTP({
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    search: globalFilter,
    sort: sorting,
    filters,
  });

  return (
    <DataView
      title="Email SMTP Configuration"
      columns={columns}
      data={data}
      isLoading={isLoading}
      height="calc(100vh - 253px)"
      error={error}
      pagination
      setPagination
      selectedRows={selectedRows}
      setSelectedRows={setSelectedRows}
      toolbar={{
        breadcrumbs: [{ label: "Email SMTP Configuration" }],
        buttonGroup: [
          {
            text: "Add SMTP Configuration",
            variant: "contained",
            tooltip: "Create a new SMTP configuration",
            icon: "lucide-plus",
            onClick: () => console.log("Creating SMTP configuration"),
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
          message: "No SMTP configurations found",
          description: "Try adjusting your filters or adding a new custom domain."
        }
      }}
    />
  );
};

export default Page;