'use client'

import { useState } from 'react';
import ToolBar from "@/components/ToolBar";
import {
    Grid,
    Card,
    CardHeader,
    CardContent,
    List,
    ListItem,
    ListItemText,
    IconButton,
} from "@mui/material";
import { useActivatePartner, usePartner, useRegeneratePartnerKeys } from '@/hooks/api/tenant/usePartners';
import { useParams } from 'next/navigation';
import RegenerateKeysDialog from '@/views/Dialogs/RegenerateKeysDialog';
import EditPartnerDrawer from '@/views/Forms/Partners/EditPartnerDrawer';

const Page = () => {
    const { name } = useParams();
    const [showKeysDialog, setShowKeysDialog] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [regeneratedKeys, setRegeneratedKeys] = useState(null);
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);

    const maskText = (text) => {
        if (!text) return '••••••••••••••••';
        return '•'.repeat(Math.max(text.length - 4, 0)) + text.slice(-4);
    };

    // Hooks 
    const { data: partner, isLoading, error } = usePartner(name);

    if (error) {
        throw new Error(error);
    }

    const activatePartner = useActivatePartner();
    const regeneratePartnerKeys = useRegeneratePartnerKeys();

    // Enhanced handler for regenerating keys
    const handleRegenerateKeys = () => {
        regeneratePartnerKeys.mutate(partner.id, {
            onSuccess: (data) => {
                setRegeneratedKeys({
                    apiKey: data.api_key,
                    secretKey: data.api_secret
                });
                setShowKeysDialog(true);
            }
        });
    };


    const copyToClipboard = (text, keyType) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Set the appropriate copied state based on key type
                if (keyType === 'API Key') {
                    setCopiedKey(true);
                    // Reset icon after 2 seconds
                    setTimeout(() => setCopiedKey(false), 2000);
                } else if (keyType === 'Secret Key') {
                    setCopiedSecret(true);  // FIXED: Use setCopiedSecret instead of setCopiedKey
                    // Reset icon after 2 seconds
                    setTimeout(() => setCopiedSecret(false), 2000);  // FIXED: Use setCopiedSecret
                }
            })
            .catch(() => {
                console.error('Failed to copy text to clipboard');
            });
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <ToolBar
                    breadcrumbs={[
                        { link: `/manage/partners/${name}`, label: partner?.display_name || "Partner" },
                    ]}
                    buttonGroup={[
                        {
                            text: 'Active',
                            variant: 'outlined',
                            tooltip: 'Activate',
                            icon: 'solar-play-circle-outline',
                            disabled: partner?.is_active || error || isLoading,
                            onClick: () => activatePartner.mutate(partner?.id),
                        },
                        {
                            text: 'Edit',
                            variant: 'outlined',
                            tooltip: 'Edit Partner',
                            icon: 'solar-pen-linear',
                            disabled: !partner?.is_active || error || isLoading,
                            onClick: () => setOpenDrawer(true),
                        },
                        {
                            label: 'Regenerate Keys',
                            icon: 'solar-refresh-outline',
                            tooltip: 'Regenerate API keys',
                            onClick: handleRegenerateKeys,
                            disabled: !partner?.is_active || error || isLoading
                        }
                    ]}
                />
            </Grid>
            <Grid item xs={12}>
                <Card>
                    <CardHeader
                        sx={{
                            '& .MuiCardHeader-action': {
                                color: 'primary.main',
                            }
                        }}
                        title='Manage partner settings'
                    />
                    <CardContent>
                        <Grid container spacing={4} component={List}>
                            <Grid item xs={6} component={ListItem}>
                                <ListItemText
                                    primary='Name'
                                    secondary={partner?.display_name || 'N/A'}
                                />
                            </Grid>
                            <Grid item xs={6} component={ListItem}>
                                <ListItemText
                                    primary='Status'
                                    secondary={partner?.is_active ? 'Active' : 'Inactive'}
                                />
                            </Grid>
                            <Grid item xs={6} component={ListItem}>
                                <ListItemText
                                    primary='API Key'
                                    secondary={partner?.credentiels?.key ? maskText(partner?.credentiels?.key) : 'N/A'}
                                />
                                {partner?.credentiels?.key && <IconButton onClick={() => copyToClipboard(partner?.credentiels?.key, 'API Key')}>
                                    <i className={`${copiedKey ? 'solar-check-circle-outline text-success' : 'solar-copy-outline'}`} />
                                </IconButton>}
                            </Grid>
                            <Grid item xs={6} component={ListItem}>
                                <ListItemText
                                    primary='Secret Key'
                                    secondary={partner?.credentiels?.secret ? maskText(partner?.credentiels?.secret) : 'N/A'}
                                />
                                {partner?.credentiels?.secret && <IconButton onClick={() => copyToClipboard(partner?.credentiels?.secret, 'Secret Key')}>
                                    <i className={`${copiedSecret ? 'solar-check-circle-outline text-success' : 'solar-copy-outline'}`} />
                                </IconButton>}
                            </Grid>

                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
            <EditPartnerDrawer
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
                data={partner}
            />
            {/* Regenerate Keys Dialog */}
            <RegenerateKeysDialog
                open={showKeysDialog}
                onClose={() => setShowKeysDialog(false)}
                keys={regeneratedKeys}
                isLoading={regeneratePartnerKeys.isLoading}
                error={regeneratePartnerKeys.error?.message}
            />
        </Grid>
    );
};

export default Page;