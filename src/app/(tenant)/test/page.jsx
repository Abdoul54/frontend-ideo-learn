'use client';

import Map from '@/components/Map';
import ToolBar from '@/components/ToolBar';
import { Grid2 } from '@mui/material';

const Page = () => {
    return (
        <Grid2 container spacing={2} >
            <Grid2 size={12}>
                <ToolBar
                    breadcrumbs={[
                        { label: 'Test', path: '/test' }
                    ]}
                />
            </Grid2>
            <Grid2 size={6}>
                <Map disableZoom disableMapType />
            </Grid2>
        </Grid2>

    );
};

export default Page;