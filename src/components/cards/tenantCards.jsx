import { useState } from "react";
import { Card, CardContent, Typography, Tooltip, Chip, Switch, Button, Menu, MenuItem, IconButton } from "@mui/material";

const TenantCard = ({ tenant, onStatusToggle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const checkSSLStatus = (tenant) => {
    if (!tenant.main_domain?.ssl?.status) {
      return { status: "none", daysLeft: null };
    }
    return { status: tenant.main_domain.ssl.status, daysLeft: null };
  };

  const { status: sslStatus } = checkSSLStatus(tenant);

  return (
    <Card className="w-full bg-white rounded-xl shadow-xs transition-all hover:shadow-md relative overflow-hidden min-h-[250px]">
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Left side - Logo and Details */}
          <div className="flex flex-col items-center sm:w-32 w-full">
            <div className="sm:w-32 sm:h-32 w-20 h-20 mb-2">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {tenant?.logo ? (
                  <img
                    src={tenant.logo}
                    alt={`${tenant?.name} logo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="ri-building-4-line text-2xl sm:text-3xl text-gray-400" />
                )}
              </div>
            </div>

            {/* Tenant Name and SSL Status under Logo */}
            <div className="text-center w-full">
              <Tooltip title={tenant.name}>
                <Typography variant="subtitle1" className="font-semibold text-sm sm:text-base truncate">
                  {tenant.name}
                </Typography>
              </Tooltip>
              <div className="flex justify-center gap-2 mt-1">
                <Chip
                  label={`SSL: ${sslStatus}`}
                  color={
                    sslStatus === "expired" ? "error" :
                      sslStatus === "expiring" ? "warning" :
                        sslStatus === "none" ? "default" :
                          "success"
                  }
                  size="small"
                />
              </div>
            </div>
          </div>

          {/* Right side - Content (Prioritized) */}
          <div className="flex-grow">
            {/* Header with name and controls */}
            <div className="flex justify-between items-end mb-2 sm:mb-4">
              <div className="flex items-center gap-2 min-h-[32px]">
                <i className="solar-global-bold-duotone w-5 h-5 text-gray-400" />
                <Tooltip title={tenant?.main_domain?.url || "No domain set"}>
                  <span className="text-xs sm:text-sm text-gray-600 truncate">
                    {tenant?.main_domain?.url || "No domain set"}
                  </span>
                </Tooltip>
              </div>
              {/* <div>
                <Tooltip title={tenant.name}>
                  <Typography variant="h6" className="font-semibold text-sm sm:text-base">
                    {tenant.name}
                  </Typography>
                </Tooltip>
                <div className="flex gap-2 mt-1">
                    <Chip
                      label={`SSL: ${sslStatus}`}
                      color={
                        sslStatus === "expired" ? "error" :
                          sslStatus === "expiring" ? "warning" :
                            sslStatus === "none" ? "default" :
                              "success"
                      }
                      size="small"
                    />
                </div>
              </div> */}

              {/* Status Switch */}
              <div className="flex items-center">
                <Tooltip title={`${tenant.status === "enable" ? "Disable" : "Enable"} Tenant`}>
                  <Switch
                    checked={tenant.status === "enable"}
                    onChange={(e) => {
                      e.stopPropagation();
                      onStatusToggle(tenant);
                    }}
                    color="success"
                    size="small"
                  />
                </Tooltip>
              </div>
            </div>

            {/* Tenant Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 min-h-[32px]">
                <i className="solar-info-circle-bold-duotone w-6 h-6 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-600 truncate">
                  {(tenant.custom_domain && tenant.custom_domain.length > 0) ? tenant.custom_domain : (
                    <Button
                      variant="text"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Setup custom domain clicked");
                      }}
                      className="p-0 min-h-0 min-w-0 text-red-600 hover:text-red-700 text-xs sm:text-sm"
                    >
                      Setup Custom Domain
                    </Button>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 min-h-[32px]">
                <i className="ri-time-zone-fill w-6 h-6 text-gray-400" />
                <Tooltip title={tenant?.timezone?.text || "No timezone set"}>
                  <span className="text-xs sm:text-sm text-gray-600 truncate">
                    {tenant?.timezone?.text || "No timezone set"}
                  </span>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2 min-h-[32px]">
                <i className="solar-calendar-bold-duotone w-5 h-5 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-600">
                  Created: {tenant?.creation_date ? new Date(tenant.creation_date).toLocaleDateString() : "Unknown"}
                </span>
              </div>

              <div className="flex items-center gap-2 min-h-[32px]">
                <i className="ion-language w-5 h-5 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-600">
                  {tenant?.language?.toUpperCase() || "Not set"}
                </span>
              </div>

              <div className="flex items-center gap-2 min-h-[32px]">
                <i className="solar-user-bold-duotone w-5 h-5 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-600">
                  {tenant?.max_users || "Not set"}
                </span>
              </div>

              {/* {sslStatus !== "none" && ( */}
              <div className="flex items-center gap-2 min-h-[32px]">
                <i className="solar-shield-bold-duotone w-5 h-5 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-600">
                  custom domain ssl: {sslStatus}
                </span>
              </div>

              <div className="flex items-center gap-2 min-h-[32px]">
                <i className="lucide-calendar-check w-6 h-6 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-600">
                  service start date: {tenant?.service_start_date ? new Date(tenant.service_start_date).toLocaleDateString() : "Unknown"}
                </span>
              </div>

              <div className="flex items-center gap-2 min-h-[32px]">
                <i className="lucide-calendar-x w-6 h-6 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-600">
                  service end date: {tenant?.service_end_date ? new Date(tenant.service_end_date).toLocaleDateString() : "Unknown"}
                </span>
              </div>

              {/* )} */}
            </div>
          </div>
        </div>

        {/* Settings Menu Button */}

        {/* <div className="flex justify-end mt-4">
          <IconButton
            onClick={handleClick}
            size="small"
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="solar-settings-bold-duotone w-6 h-6" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem onClick={handleClose}>Delete Tenant</MenuItem>
            <MenuItem onClick={handleClose}>Manage Domains</MenuItem>
            <MenuItem onClick={handleClose}>Configure SMTP</MenuItem>
            <MenuItem onClick={handleClose}>Configure SSL</MenuItem>
          </Menu>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default TenantCard;