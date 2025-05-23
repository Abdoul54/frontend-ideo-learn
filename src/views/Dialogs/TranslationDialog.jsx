import CustomTabList from "@/@core/components/mui/TabList"
import TextInput from "@/components/inputs/TextInput"
import { useUpdateTranslation } from "@/hooks/api/tenant/useLocalization"
import { TabContext, TabPanel } from "@mui/lab"
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tab } from "@mui/material"
import { useState } from "react"
import { useForm } from "react-hook-form"


const TranslationDialog = ({ open, onClose, data, active }) => {

    const [activeTab, setActiveTab] = useState(active || data?.language?.code)

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
    }

    const { control, handleSubmit } = useForm({
        defaultValues: {
            text_language: data?.text_language,
            text_compare: data?.text_compare
        }
    })

    const translate = useUpdateTranslation()

    const onSubmit = async (formData) => {
        if (activeTab === data?.language?.code)
            translate.mutateAsync({ id: data?.id, data: { locale: data?.language?.code, text: formData?.text_language } }).then(() => {
                onClose()
            })
        else
            translate.mutateAsync({ id: data?.id, data: { locale: data?.comparedTo?.code, text: formData?.text_compare } }).then(() => {
                onClose()
            })
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth component={"form"} onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle>Translate</DialogTitle>
            <DialogContent >
                <TabContext value={activeTab}>
                    <CustomTabList
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTabs-flexContainer': {
                                width: '100%'
                            }
                        }}
                    >
                        <Tab value={data?.language?.code} label={data?.language?.native_name} />
                        <Tab value={data?.comparedTo?.code} label={data?.comparedTo?.native_name} />
                    </CustomTabList>
                    <TabPanel value={data?.language?.code}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                p: 2
                            }}
                        >
                            <TextInput
                                name="text_language"
                                label={`Translation ${data?.language?.native_name}`}
                                control={control}
                                placeholder="Enter translation here..."
                                multiline
                                maxRows={4}
                            />
                        </Box>
                    </TabPanel>
                    <TabPanel value={data?.comparedTo?.code}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                p: 2
                            }}
                        >
                            <TextInput
                                name="text_compare"
                                label={`Compare ${data?.comparedTo?.native_name}`}
                                control={control}
                                placeholder="Enter translation here..."
                                multiline
                                maxRows={4}
                            />
                        </Box>
                    </TabPanel>
                </TabContext>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onClose}
                    disabled={translate?.isLoading}
                >
                    Cancel
                </Button>
                <Button
                    color="primary"
                    variant="contained"
                    type="submit"
                    disabled={translate?.isLoading}
                    startIcon={translate?.isLoading ? <i className="svg-spinners-90-ring" /> : null}
                >
                    {
                        translate?.isLoading ? 'Translating...' : 'Translate'
                    }
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default TranslationDialog 