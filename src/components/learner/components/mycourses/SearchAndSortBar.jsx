import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';

/**
 * SearchAndSortBar component - handles search input and sort dropdown
 * 
 * @param {Object} props
 * @param {string} props.searchQuery - Current search query
 * @param {Function} props.setSearchQuery - Function to update search query
 * @param {string} props.sortOption - Current sort option
 * @param {Function} props.handleSortChange - Function to handle sort change
 * @param {Function} props.toggleFilters - Function to toggle filters panel
 * @param {boolean} props.isFilterActive - Whether any filter is active
 * @param {number} props.activeFilterCount - Number of active filters
 * @returns {JSX.Element}
 */
const SearchAndSortBar = ({
  searchQuery,
  setSearchQuery,
  sortOption,
  handleSortChange,
  toggleFilters,
  isFilterActive,
  activeFilterCount
}) => {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: 4,
      flexWrap: { xs: 'wrap', md: 'nowrap' },
      gap: 2
    }}>
      {/* Filter Button & Search */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        gap: 2,
        width: { xs: '100%', md: 'auto' }
      }}>
        <Paper
          onClick={toggleFilters}
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: isFilterActive ? 'primary.main' : 'divider',
            borderRadius: 1,
            px: 3,
            py: 2.4,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            position: 'relative',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <i className="solar-tuning-square-bold-duotone" style={{
            color: isFilterActive ? 'var(--mui-palette-primary-main)' : 'inherit'
          }} />
          <Typography variant="body2">FILTRES</Typography>

          {/* Badge for active filters */}
          {isFilterActive && (
            <Box
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}
            >
              {activeFilterCount}
            </Box>
          )}
        </Paper>

        <TextField
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          sx={{
            backgroundColor: 'background.paper',
          }}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <i className="solar-rounded-magnifer-line-duotone" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <i className="solar-close-circle-bold-duotone" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Sort Dropdown */}
      <FormControl size="small" sx={{ minWidth: 220 }}>
        <Select
          value={sortOption}
          onChange={handleSortChange}
          displayEmpty
          sx={{
            borderRadius: 2,
            backgroundColor: 'background.paper',
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              py: 2,
              pl: 1.5,
            },
          }}
          inputProps={{ 'aria-label': 'Sort' }}
        >
          <MenuItem value="name_az">Nom A-Z</MenuItem>
          <MenuItem value="name_za">Nom Z-A</MenuItem>
          <MenuItem value="code_az">Code A-Z</MenuItem>
          <MenuItem value="code_za">Code Z-A</MenuItem>
          <MenuItem value="newest_to_oldest">Date d'inscription (plus récent)</MenuItem>
          <MenuItem value="oldest_to_newest">Date d'inscription (plus ancien)</MenuItem>
          <MenuItem value="nearest_expiration">Date d'expiration (plus proche)</MenuItem>
          <MenuItem value="farthest_expiration">Date d'expiration (plus lointaine)</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default SearchAndSortBar;