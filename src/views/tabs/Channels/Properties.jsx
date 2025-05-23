import TextInput from "@/components/inputs/TextInput";
import {
    Button,
    Grid2 as Grid,
    List,
    ListItem,
    ListItemText,
    Typography,
    Divider,
    Stack,
    Card,
    CardContent,
    FormControl,
    FormControlLabel,
    Switch,
    Avatar,
    IconButton,
    Box,
    Chip,
    Collapse
} from "@mui/material";

import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";

import SmartMultilangTextInput from "@/components/inputs/MultilangInput";
import ColorInput from "@/components/inputs/ColorInput";
import { Lucide } from "@/utils/getters/getLucide";
import CustomDropdown from "@/@core/components/custom-dropdown";
import { FixedSizeGrid } from "react-window";
import SelectInput from "@/components/inputs/SelectInput";
import GroupsSelectionDrawer from "@/views/Forms/Channels/GroupsSelectionDrawer";
import BranchesSelectionDrawer from "@/views/Forms/Channels/BranchesSelectionDrawer";
import SwitchInput from "@/components/inputs/SwitchInput";
import { useUpdateChannel } from "@/hooks/api/tenant/learn/useChannels";
import { useTranslation } from '@/@core/contexts/translationContext';


const CELL_SIZE = 48
const GRID_COLUMNS = 8

const VirtualizedIconGrid = ({ icons = [], onChange }) => {
    const rowCount = Math.ceil(icons.length / GRID_COLUMNS)

    const Cell = ({ columnIndex, rowIndex, style }) => {
        const index = rowIndex * GRID_COLUMNS + columnIndex
        if (index >= icons.length) return null

        const icn = icons[index]

        return (
            <Box style={style} display="flex" alignItems="center" justifyContent="center">
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation()
                        onChange(icn)
                    }}
                    sx={{ borderRadius: 1 }}
                >
                    <i className={icn} style={{ fontSize: 20 }} />
                </IconButton>
            </Box>
        )
    }


    return (
        <FixedSizeGrid
            columnCount={GRID_COLUMNS}
            columnWidth={CELL_SIZE}
            height={240}
            rowCount={rowCount}
            rowHeight={CELL_SIZE}
            width={400}
            children={Cell}
        />
    )
}

const ChangeIcon = ({ icon, onChange, icons = [], color, bgcolor }) => {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 56, height: 56, bgcolor }}>
                <i className={icon} style={{
                    color: color, fontSize: 24,
                }} />
            </Avatar>

            <CustomDropdown
                Icon={Button}
                leftAlignMenu
                iconButtonProps={{
                    label: 'Change Icon',
                    variant: 'outlined',
                    size: 'medium',
                }}
                items={<VirtualizedIconGrid icons={icons} onChange={onChange} />}
            />
        </Stack>
    )
}

const channelsSorting = [
    { label: 'Name Ascending', value: 'name_asc' },
    { label: 'Name Descending', value: 'name_desc' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Newest', value: 'newest' }
]

const Properties = ({ channel }) => {
    const { translate } = useTranslation();
    const [drawerState, setDrawerState] = useState({
        open: false,
        data: null,
        type: null
    });

    const [selectedGroups, setSelectedGroups] = useState([])
    const [selectedBranches, setSelectedBranches] = useState([])
    const [isAll, setIsAll] = useState(false)
    const updateChannel = useUpdateChannel();

    const { control, handleSubmit, reset, setValue, getValues, watch } = useForm({
        defaultValues: {
            "translations": {
                "all": "",
            },
            "description_translations": {
                "all": "",
            },
            "thumbnail": {
                "icon": "lucide-star",
                "icon_code_color": "#FFA500",
                "background_code_color": "#EFEFEF"
            },
            "sorting": "",
            "visibility": "all",
            "status": "",
            "groups_ids": [],
            "branches_ids": []
        },
    });

    useEffect(() => {
        if (channel) {
            setSelectedGroups(channel?.groups)
            setSelectedBranches(channel?.branches)
            reset({
                translations: channel?.name_translations,
                description_translations: channel?.description_translations,
                thumbnail: channel?.thumbnail,
                sorting: channel?.sorting,
                visibility: channel?.visibility,
                status: channel?.status,
                groups_ids: channel?.groups?.map((group) => group?.id) || [],
                branches_ids: channel?.branches?.map((branch) => branch?.id) || [],
            });
        }
    }, [channel, reset]);

    const bgColor = watch('thumbnail.background_code_color')
    const color = watch('thumbnail.icon_code_color')
    const groups = watch('groups_ids')
    const branches = watch('branches_ids')
    const visibility = watch('visibility')


    const handleDeleteGroup = (groupId) => {
        setSelectedGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId));
    };

    const handleDeleteBranch = (branchId) => {
        setSelectedBranches((prevBranches) => prevBranches.filter((branch) => branch.id !== branchId));
    };

    const onSubmit = async (formData) => {
        try {
            const data = {
                ...formData,
                groups_ids: formData?.visibility === "all" ? [] : selectedGroups?.map((group) => group?.id) || [],
                branches_ids: formData?.visibility === "all" ? [] : selectedBranches?.map((branch) => branch?.id) || [],
            }

            if (isAll) {
                data.translations = {
                    all: formData.translations.all
                };
                data.description_translations = {
                    all: formData.description_translations.all
                };
            } else {
                delete data.translations.all;
                delete data.description_translations.all;
                data.translations = {
                    ...formData.translations
                };
                data.description_translations = {
                    ...formData.description_translations
                };
            }

            await updateChannel.mutateAsync({
                id: channel?.id,
                data
            });

        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <>
            <Card>
                <CardContent>
                    <Grid container spacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
                        <Grid item size={12}>
                            <Typography variant="h4">{translate('Channel management.SECTION_GENERAL', 'General')}</Typography>
                        </Grid>
                        <Grid item size={12}>
                            <List>
                                <ListItem>
                                    <ListItemText
                                        primary={translate('Channel management.SECTION_CHANNEL_INFO', 'Channel info')}
                                        slotProps={{
                                            primary: { variant: 'h5' },
                                        }}
                                    />
                                </ListItem>
                                <ListItem>
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
                                </ListItem>
                                {isAll ? (
                                    <ListItem>
                                        <TextInput
                                            name="translations.all"
                                            control={control}
                                            rules={{ required: translate('Channel management.VALIDATION_NAME_REQUIRED', 'Name is required') }}
                                            label={translate('common.name', 'Name')}
                                        />
                                    </ListItem>
                                ) : (
                                    <ListItem>
                                        <SmartMultilangTextInput
                                            name="translations"
                                            control={control}
                                            label={translate('common.name', 'Name')}
                                            watch={watch}
                                            getValues={getValues}
                                            setValue={setValue}
                                        />
                                    </ListItem>
                                )}
                                {isAll ? (
                                    <ListItem>
                                        <TextInput
                                            name="description_translations.all"
                                            control={control}
                                            label={translate('common.description', 'Description')}
                                        />
                                    </ListItem>
                                ) : (
                                    <ListItem>
                                        <SmartMultilangTextInput
                                            name="description_translations"
                                            control={control}
                                            label={translate('common.description', 'Description')}
                                            watch={watch}
                                            getValues={getValues}
                                            setValue={setValue}
                                            required={false}
                                        />
                                    </ListItem>
                                )}
                                <ListItem>
                                    <SelectInput
                                        name='status'
                                        label={translate('Channel management.FIELD_STATUS', 'Status')}
                                        control={control}
                                        options={[
                                            { label: translate('common.published', 'Published'), value: 'published' },
                                            { label: translate('common.unpublished', 'Unpublished'), value: 'unpublished' }
                                        ]}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary={translate('Channel management.SECTION_THUMBNAIL_COMPOSER', 'Thumbnail composer')}
                                        slotProps={{
                                            primary: { variant: 'h5' },
                                        }} />
                                </ListItem>
                                <ListItem sx={{ display: 'flex', alignItems: 'center', width: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: "35%" }}>
                                        <Controller
                                            control={control}
                                            name="thumbnail.icon"
                                            render={({ field }) => (
                                                <ChangeIcon
                                                    icon={field.value}
                                                    onChange={field.onChange}
                                                    color={color}
                                                    bgcolor={bgColor}
                                                    icons={Lucide}
                                                />
                                            )}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: 1 }}>
                                        <ColorInput
                                            control={control}
                                            name="thumbnail.icon_code_color"
                                            label={translate('Channel management.FIELD_ICON_COLOR', 'Icon Color')}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: 1 }}>
                                        <ColorInput
                                            control={control}
                                            name="thumbnail.background_code_color"
                                            label={translate('Channel management.FIELD_BACKGROUND_COLOR', 'Background Color')}
                                        />
                                    </Box>
                                </ListItem>
                            </List>
                        </Grid>
                        <Grid item size={12}>
                            <Divider />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="h4">{translate('Channel management.SECTION_DETAILS', 'Details')}</Typography>
                        </Grid>
                        <Grid item size={12}>
                            <List>
                                <ListItem>
                                    <SelectInput
                                        label={translate('Channel management.FIELD_SORTING', 'Sorting')}
                                        name="sorting"
                                        control={control}
                                        options={channelsSorting}
                                        labelKey="label"
                                        valueKey="value"
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                        <Grid item size={12}>
                            <Divider />
                        </Grid>
                        <Grid item size={12}>
                            <Typography variant="h4">{translate('Channel management.SECTION_VISIBILITY', 'Visibility')}</Typography>
                        </Grid>
                        <Grid item size={12}>
                            <List>
                                <ListItem>
                                    <ListItemText
                                        primary={translate('Channel management.SECTION_PROFILE_INFO', 'Profile information')}
                                        slotProps={{
                                            primary: { variant: 'h5' },
                                        }}
                                    />
                                </ListItem>
                                <ListItem>
                                    <SwitchInput
                                        control={control}
                                        name="visibility"
                                        label={<ListItemText
                                            primary={translate('Channel management.SWITCH_CUSTOM_SELECTION', 'Custom Selection')}
                                            secondary={translate('Channel management.SWITCH_CUSTOM_SELECTION_DESC', 'Select specific groups and branches')}
                                        />}
                                        uncheckedValue={"all"}
                                        checkedValue={"custom"}
                                    />
                                </ListItem>
                                <Collapse in={visibility === "custom"}>
                                    <ListItem>
                                        <ListItemText
                                            primary={translate('common.groups', 'Groups')}
                                            secondary={translate('Channel management.GROUPS_SELECTED', { count: selectedGroups?.length || 0 })}
                                            slotProps={{
                                                primary: { variant: 'h5' },
                                            }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <Stack gap={2} direction="row" sx={{
                                            border: 1,
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            padding: 3,
                                            width: 1,
                                            backgroundColor: 'background.default',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}>
                                            <Stack spacing={1} direction="row" alignItems="center" flexWrap="wrap">
                                                {
                                                    selectedGroups?.map((group) => (
                                                        <Chip
                                                            key={group?.id}
                                                            label={group?.name}
                                                            variant="outlined"
                                                            color="primary"
                                                            deleteIcon={<i className="solar-close-circle-outline" />}
                                                            onDelete={() => handleDeleteGroup(group?.id)}
                                                        />
                                                    ))
                                                }
                                            </Stack>
                                            <Button
                                                variant='text'
                                                color="primary"
                                                sx={{ mt: 2 }}
                                                onClick={() => setDrawerState({ open: true, data: groups, type: 'groups' })}
                                                startIcon={<i className="solar-add-circle-outline" />}
                                            >
                                                {translate('Channel management.BUTTON_SELECT_GROUPS', 'Select Groups')}
                                            </Button>
                                        </Stack>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary={translate('common.branches', 'Branches')}
                                            secondary={translate('Channel management.BRANCHES_SELECTED', { count: selectedBranches?.length || 0 })}
                                            slotProps={{
                                                primary: { variant: 'h5' },
                                            }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <Stack gap={2} direction="row" sx={{
                                            border: 1,
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            padding: 3,
                                            width: 1,
                                            backgroundColor: 'background.default',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}>
                                            <Stack spacing={1} direction="row" alignItems="center" flexWrap="wrap">
                                                {
                                                    selectedBranches?.map((branch) => (
                                                        <Chip
                                                            key={branch?.id}
                                                            label={branch?.name}
                                                            variant="outlined"
                                                            color="primary"
                                                            deleteIcon={<i className="solar-close-circle-outline" />}
                                                            onDelete={() => handleDeleteBranch(branch?.id)}
                                                        />
                                                    ))
                                                }
                                            </Stack>
                                            <Button
                                                variant='text'
                                                color="primary"
                                                sx={{ mt: 2 }}
                                                onClick={() => setDrawerState({ open: true, data: branches, type: 'branches' })}
                                                startIcon={<i className="solar-add-circle-outline" />}
                                            >
                                                {translate('Channel management.BUTTON_SELECT_BRANCHES', 'Select Branches')}
                                            </Button>
                                        </Stack>
                                    </ListItem>
                                </Collapse>
                            </List>
                        </Grid>

                        {/* Form Actions */}
                        <Grid item size={12}
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 2,
                            }}
                        >
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={updateChannel?.isPending}
                            >
                                {updateChannel?.isPending 
                                  ? translate('common.saving', 'Saving...') 
                                  : translate('common.save', 'Save')}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            {
                visibility === "custom" && drawerState?.open && drawerState?.type === 'groups' && (
                    <GroupsSelectionDrawer
                        open={drawerState.open}
                        onClose={() => setDrawerState({ open: false, data: null, type: null })}
                        data={selectedGroups}
                        setGroups={setSelectedGroups}
                    />
                )
            }
            {
                visibility === "custom" && drawerState?.open && drawerState?.type === 'branches' && (
                    <BranchesSelectionDrawer
                        open={drawerState.open}
                        onClose={() => setDrawerState({ open: false, data: null, type: null })}
                        data={selectedBranches}
                        setBranches={setSelectedBranches}
                    />
                )
            }
        </>
    );
};

export default Properties;