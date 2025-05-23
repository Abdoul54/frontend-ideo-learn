'use client';

import { useForm } from "react-hook-form";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    FormControl,
    FormControlLabel,
    Grid2 as Grid,
    List,
    ListItem,
    ListItemText,
    Switch,
} from "@mui/material";
import DrawerFormContainer from "@/components/DrawerFormContainer";
import TextInput from "@/components/inputs/TextInput";
import { useCreateChannel } from "@/hooks/api/tenant/learn/useChannels";
import { useRef, useState } from "react";
import SmartMultilangTextInput from "@/components/inputs/MultilangInput";
import { useTranslation } from '@/@core/contexts/translationContext';

const ChannelsDrawer = ({ open, onClose, data }) => {
    const { translate } = useTranslation();
    
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        getValues,
        reset
    } = useForm({
        defaultValues: {
            translations: { all: "" },
            description_translations: { all: "" },
        },
    });

    const [isAll, setIsAll] = useState(false);

    const createChannel = useCreateChannel();

    const onSubmit = (submittedData) => {
        let { translations, description_translations } = submittedData;

        if (isAll) {
            translations = { all: translations.all };
            description_translations = { all: description_translations.all };
        } else {
            // Remove 'all' key
            const { all, ...restTranslations } = translations;
            const { all: _, ...restDescTranslations } = description_translations;

            translations = restTranslations;
            // Keep only non-empty descriptions
            description_translations = Object.fromEntries(
                Object.entries(restDescTranslations).filter(([_, value]) => value)
            );
        }

        const channelData = {
            translations,
            ...(Object.keys(description_translations).length > 0 && {
                description_translations
            })
        };

        createChannel.mutateAsync(channelData).then(() => {
            reset();
            onClose();
        });
    };

    return (
        <DrawerFormContainer
            title={translate('Channel management.DRAWER_TITLE_CREATE_CHANNEL', 'Create Channel')}
            description={translate('Channel management.DRAWER_DESCRIPTION_CREATE_CHANNEL', 'Create a new channel to organize your content')}
            open={open}
            onClose={onClose}
        >
            <Card
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: 0
                }}
            >
                <CardContent
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'auto',
                        p: 2,
                        '&::-webkit-scrollbar': { width: '0.4em' },
                        '&::-webkit-scrollbar-track': { background: 'var(--mui-palette-background-paper)' },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'var(--mui-palette-primary-main)',
                            borderRadius: 2
                        }
                    }}
                >
                    <Grid container rowSpacing={3} padding={2} component={List}>
                        <Grid item size={12} component={ListItem}>
                            <FormControl>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isAll}
                                            onChange={e => setIsAll(e.target.checked)}
                                        />
                                    }
                                    label={
                                        <ListItemText
                                            primary={translate('Channel management.SWITCH_ALL_LANGUAGES', 'All Languages')}
                                            secondary={translate('Channel management.SWITCH_ALL_LANGUAGES_DESC', 'Apply to all languages')}
                                        />
                                    }
                                />
                            </FormControl>
                        </Grid>

                        {isAll ? (
                            <Grid item size={12} component={ListItem}>
                                <TextInput
                                    name="translations.all"
                                    control={control}
                                    rules={{ required: translate('Channel management.VALIDATION_NAME_REQUIRED', 'Name is required') }}
                                    label={translate('common.name', 'Name')}
                                />
                            </Grid>
                        ) : (
                            <Grid item size={12} component={ListItem}>
                                <SmartMultilangTextInput
                                    name="translations"
                                    control={control}
                                    label={translate('common.name', 'Name')}
                                    watch={watch}
                                    getValues={getValues}
                                    setValue={setValue}
                                />
                            </Grid>
                        )}
                        {isAll ? (
                            <Grid item size={12} component={ListItem}>
                                <TextInput
                                    name="description_translations.all"
                                    control={control}
                                    label={translate('common.description', 'Description')}
                                />
                            </Grid>
                        ) : (
                            <Grid item size={12} component={ListItem}>
                                <SmartMultilangTextInput
                                    name="description_translations"
                                    control={control}
                                    label={translate('common.description', 'Description')}
                                    watch={watch}
                                    getValues={getValues}
                                    setValue={setValue}
                                    required={false}
                                />
                            </Grid>
                        )}
                    </Grid>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button onClick={onClose} disabled={createChannel?.isPending}>
                        {translate('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={createChannel?.isPending}
                    >
                        {createChannel?.isPending
                            ? translate('common.creating', 'Creating...')
                            : translate('common.create', 'Create')
                        }

                    </Button>
                </CardActions>
            </Card>
        </DrawerFormContainer>
    );
};

export default ChannelsDrawer;