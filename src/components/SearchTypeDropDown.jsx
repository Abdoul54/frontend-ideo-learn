// SearchTypeDropdown.jsx
import React, { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, ListItemIcon, Tooltip, ListItemText } from '@mui/material';

const SEARCH_TYPES = [
  { id: 0, label: 'All branches', value: 1 },
  { id: 1, label: 'Current branch', value: 2 },
  { id: 2, label: 'Current branch + sub-branches', value: 3 }
];

const SearchTypeDropdown = ({ value, onChange, disabled = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (searchType) => {
    onChange(searchType);
    handleClose();
  };

  // Find the current selected type
  const selectedType = SEARCH_TYPES.find(type => type.value === value) || SEARCH_TYPES[0];

  return (
    <>
      <Tooltip title="Search Type" placement="top">
        <IconButton
          onClick={handleClick}
          size="small"
          disabled={disabled}
        >
          <i className="solar-alt-arrow-down-line-duotone" style={{ width: '18px', height: '18px' }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {SEARCH_TYPES.map((type) => (
          <MenuItem
            key={type.id}
            onClick={() => handleSelect(type.value)}
            selected={value === type.value}
          >
            <ListItemText primary={type.label} />
            {value === type.value && (
              <ListItemIcon>
                <i className="lucide-check" />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default SearchTypeDropdown;