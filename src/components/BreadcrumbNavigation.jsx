import React from 'react';
import { Breadcrumbs, Link, Typography, Stack } from '@mui/material';

const BreadcrumbNavigation = ({ 
  breadcrumbs = [], 
  onNavigate 
}) => {
  if (!breadcrumbs?.length) {
    return (
      <Breadcrumbs
        separator={<i size={16} className="lucide-chevron-right text-gray-400" />}
        aria-label="breadcrumb"
        className="px-4"
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <i size={16} className="solar-home-2-bold-duotone text-gray-500" />
          <Typography color="text.primary">Platform</Typography>
        </Stack>
      </Breadcrumbs>
    );
  }

  return (
    <Breadcrumbs
      separator={<i size={16} className="lucide-chevron-right text-gray-400" />}
      aria-label="breadcrumb"
      className="px-4"
    >
      <Link
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onNavigate({ id: 1, title: 'Platform' });
        }}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 no-underline"
      >
        <i size={16} className='solar-home-2-bold-duotone' />
        <span>Platform</span>
      </Link>
      
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        if (isLast) {
          return (
            <Typography
              key={crumb.id}
              color="text.primary"
              className="font-medium"
            >
              {crumb.title}
            </Typography>
          );
        }

        return (
          <Link
            key={crumb.id}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate(crumb);
            }}
            className="text-gray-500 hover:text-gray-700 no-underline"
          >
            {crumb.title}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbNavigation;