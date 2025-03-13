'use client';

import { useEffect, useState } from 'react';
import ToolBar from "@/components/ToolBar";
import { Grid } from "@mui/material";
import { useSession } from 'next-auth/react';

const Page = () => {
  const { status } = useSession();
  const [isClient, setIsClient] = useState(false);

  // This helps avoid hydration errors when redirecting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show nothing during initial server render to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  // Display a loading indicator while session is loading
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <i className='svg-spinners:90-ring text-2xl' />
      </div>
    );
  }

  return (
    <Grid container gap={4}>
      <Grid item xs={12}>
        <ToolBar breadcrumbs={[{ label: 'Home' }]} />
      </Grid>
    </Grid>
  );
};

export default Page;