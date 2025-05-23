'use client';

import React from 'react';
import {
    Box,
    Button,
} from '@mui/material';

const NavButtons = ({ isFirstLesson, isLastLesson, onPrevious, onNext }) => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
                variant="outlined"
                size="small"
                startIcon={<i className="lucide-chevron-left" size={16} />}
                disabled={isFirstLesson}
                onClick={onPrevious}
            >
                Previous lesson
            </Button>
            <Button
                variant="outlined"
                size="small"
                endIcon={<i className="lucide-chevron-right" size={16} />}
                disabled={isLastLesson}
                onClick={onNext}
            >
                Next lesson
            </Button>
        </Box>
    );
};

export default NavButtons;