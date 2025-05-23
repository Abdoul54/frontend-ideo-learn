import { useLearningUnitScos, useLearningUnitVersions } from "@/hooks/api/tenant/repos/useLeaningUnits";
import ScoSidebar from "@/views/course-details/ScoSidebar";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Select,
    MenuItem,
    Grid2 as Grid,
    IconButton
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

const Previewer = ({
    open,
    onClose,
    data
}) => {
    const iframeRef = useRef(null);
    const [iframeSrc, setIframeSrc] = useState('about:blank');
    const [selectedScoId, setSelectedScoId] = useState(null);

    const handleChildClick = (child) => {
        console.log('Child clicked:', child);
        if (child && child?.preview_data?.preview_url) {
            console.log('Preview URL:', child.preview_data.preview_url);
            setIframeSrc(child.preview_data.preview_url);
            setSelectedScoId(child.id);
        }
    };

    const { data: versions } = useLearningUnitVersions(data?.id)
    const [activeVersionId, setActiveVersionId] = useState(null)

    const { data: scos } = useLearningUnitScos({
        learningUnitId: data?.id,
        version: activeVersionId
    })

    // Set the active version
    useEffect(() => {
        if (versions?.active_version_id) {
            setActiveVersionId(versions.active_version_id);
        }
    }, [versions]);

    // Load the first SCO when data is available or when version changes
    useEffect(() => {
        if (scos?.first_sco?.preview_data?.preview_url) {
            console.log('Setting initial SCO:', scos.first_sco.title);
            setIframeSrc(scos.first_sco.preview_data.preview_url);
            setSelectedScoId(scos.first_sco.id);
        }
    }, [scos]);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleVersionChange = (e) => {
        const newVersionId = e.target.value;
        setActiveVersionId(newVersionId);
        // Reset the iframe to blank until new content loads
        setIframeSrc('about:blank');
        // Reset the selected SCO ID
        setSelectedScoId(null);
    };

    return (
        <Dialog open={open} onClose={handleClose}
            maxWidth="xl"
            fullWidth
            PaperProps={{
                sx: { height: '80vh' }
            }}
        >
            <Box className="flex justify-between items-center p-4 border-b">
                <DialogTitle sx={{ p: 0, m: 0 }} className="text-xl font-semibold">Preview: {data?.title}</DialogTitle>
                <IconButton
                    onClick={handleClose}
                    size="medium"
                    sx={{ p: 1 }}
                >
                    <i className="lucide-x h-5 w-5" />
                </IconButton>
            </Box>
            <DialogContent
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    height: 'calc(80vh - 64px)', // Subtracting the DialogTitle height
                    overflow: 'hidden' // prevent scroll explosion
                }}
            >
                <Grid container spacing={2} sx={{ height: 'calc(100% - 60px)' }}> {/* Reserving space for Select */}
                    <Grid item size={12} sx={{ mb: 2 }}>
                        <Select
                            fullWidth
                            value={activeVersionId || ''}
                            onChange={handleVersionChange}
                        >
                            {versions?.versions?.map((version) => (
                                <MenuItem key={version?.id} value={version?.id}>
                                    {version?.value}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid container item spacing={2} sx={{ height: 'calc(100% - 20px)', width: 1 }}> {/* Container for sidebar and iframe */}
                        <Grid item size={{
                            xs: 12,
                            md: 4
                        }} sx={{ height: '100%', overflow: 'auto' }}> {/* Fixed size prop */}
                            <ScoSidebar
                                key={`scos-${activeVersionId}`} // Key helps remount when version changes
                                scos={scos?.scos}
                                initialSelectedId={selectedScoId}
                                onChildClick={handleChildClick}
                            />
                        </Grid>
                        <Grid item size={{
                            xs: 12,
                            md: 8
                        }} sx={{ height: '100%' }}> {/* Fixed size prop */}
                            <Box
                                component="iframe"
                                ref={iframeRef}
                                src={iframeSrc}
                                title="Learning Unit Preview"
                                width="100%"
                                height="100%"
                                sx={{ border: 'none', display: 'block' }} // Added display: block for better rendering
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default Previewer;