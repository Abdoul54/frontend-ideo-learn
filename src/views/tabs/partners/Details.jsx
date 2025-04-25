'use client'

import { useState } from 'react';
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
import { provisioningFieldsColumns } from '@/constants/partners';
import DataTable from '@/components/datatable/DataTable';

const Details = ({
    partner,
    isLoading,
    error
}) => {
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);

    const maskText = (text) => {
        if (!text) return '••••••••••••••••';
        return '•'.repeat(Math.max(text.length - 4, 0)) + text.slice(-4);
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
        <Card
            sx={{
                border: 0
            }}
        >
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
                            secondary={partner?.name || 'N/A'}
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
                            secondary={partner?.credentials?.key ? maskText(partner?.credentials?.key) : 'N/A'}
                        />
                        {partner?.credentials?.key && <IconButton onClick={() => copyToClipboard(partner?.credentials?.key, 'API Key')}>
                            <i className={`${copiedKey ? 'solar-check-circle-outline text-success' : 'solar-copy-outline'}`} />
                        </IconButton>}
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <ListItemText
                            primary='Secret Key'
                            secondary={partner?.credentials?.secret ? maskText(partner?.credentials?.secret) : 'N/A'}
                        />
                        {partner?.credentials?.secret && <IconButton onClick={() => copyToClipboard(partner?.credentials?.secret, 'Secret Key')}>
                            <i className={`${copiedSecret ? 'solar-check-circle-outline text-success' : 'solar-copy-outline'}`} />
                        </IconButton>}
                    </Grid>
                    <Grid item xs={6} component={ListItem}>
                        <ListItemText
                            primary='Username Attribute'
                            secondary={partner?.username_attribute || 'N/A'}
                        />
                    </Grid>
                    {
                        partner?.enable_user_provisioning &&
                        <>
                            <Grid item xs={12} component={ListItem}>
                                <ListItemText
                                    primaryTypographyProps={{ variant: 'h6' }}
                                    primary='Provisioning Fields'
                                />
                            </Grid>
                            <Grid item xs={12} component={ListItem} disablePadding>
                                <DataTable
                                    columns={provisioningFieldsColumns}
                                    data={partner?.provisioning_fields}
                                    height='calc(100vh - 614px)'
                                    emptyStateProps={{
                                        height: 'calc(100vh - 704px)',
                                    }}
                                    variant='outlined'
                                    noPagination
                                    isLoading={isLoading}
                                    error={error}
                                />
                            </Grid>
                        </>
                    }
                </Grid>
            </CardContent>
        </Card>
    );
};

export default Details;