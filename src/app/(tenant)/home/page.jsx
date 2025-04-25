'use client';

import ToolBar from "@/components/ToolBar";
import { Grid } from "@mui/material";

const Page = () => {
  // const { settings, updateSettings } = useSettings()

  // console.log('settings', settings?.language)

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <ToolBar breadcrumbs={[{ label: 'Home' }]} />
      </Grid>
      {/* <Grid item xs={12}>
        <ToggleButtonGroup>
          <ToggleButton value="en" selected={settings?.language?.locale === 'en' && settings?.language?.direction === 'ltr'} onClick={() => updateSettings({ language: { locale: 'en', direction: 'ltr' } })}>English</ToggleButton>
          <ToggleButton value="ar" selected={settings?.language?.locale === 'ar' && settings?.language?.direction === 'rtl'} onClick={() => updateSettings({ language: { locale: 'ar', direction: 'rtl' } })}>العربية</ToggleButton>
          <ToggleButton value="fr" selected={settings?.language?.locale === 'fr' && settings?.language?.direction === 'ltr'} onClick={() => updateSettings({ language: { locale: 'fr', direction: 'ltr' } })}>Français</ToggleButton>
        </ToggleButtonGroup>
      </Grid> */}

    </Grid>
  );
};

export default Page;