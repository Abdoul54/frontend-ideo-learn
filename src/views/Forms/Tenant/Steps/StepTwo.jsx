import ColorInput from "@/components/inputs/ColorInput";
import FileInput from "@/components/inputs/FileInput";
import SelectInput from "@/components/inputs/SelectInput";
import SwitchInput from "@/components/inputs/SwitchInput";
import TextInput from "@/components/inputs/TextInput";
import { Grid } from "@mui/material";

const StepTwo = ({ control, watch }) => (
    <>
        <Grid item xs={12}>
            <TextInput
                name="header.page_title"
                control={control}
                label="Page Title"
            />
        </Grid>
        <Grid item xs={12}>
            <SwitchInput
                name="header.header_message.status"
                control={control}
                label="Header Message"
                checkedValue="enabled"
                uncheckedValue="disabled"
            />
        </Grid>
        {watch("header.header_message.status") === "enabled" && (
            <Grid item xs={12}>
                <TextInput
                    name="header.header_message.content"
                    control={control}
                    label="Header Message"
                />
            </Grid>
        )}
        <Grid item xs={12}>
            <FileInput
                control={control}
                name="header.logo"
                accept='image/*'
                label="Logo"
                onChange={(file) => console.log(file)}
                maxSize={1024 * 1024}
            />
        </Grid>
        <Grid item xs={12}>
            <FileInput
                control={control}
                name="header.favicon"
                accept='image/x-icon,image/png'
                label="Favicon"
                onChange={(file) => console.log(file)}
                maxSize={1024 * 1024}
            />
        </Grid>
        <Grid item xs={12}>
            <SelectInput
                control={control}
                name="sign_in_page.type"
                label="Type"
                options={[
                    { value: "color", label: "Color" },
                    { value: "image", label: "Image" },
                    { value: "video", label: "Video" },
                ]}
            />
        </Grid>
        {
            watch("sign_in_page.type") === "color" && (
                <>
                    <Grid item xs={12}>
                        <ColorInput
                            name="sign_in_page.color_data"
                            control={control}
                            label="Background Color"
                        />
                    </Grid>
                </>
            )
        }
        {
            watch("sign_in_page.type") === "image" && (
                <>
                    <Grid item xs={12}>
                        <FileInput
                            name="sign_in_page.bg_data"
                            control={control}
                            label="Background Image"
                            accept="image/*"
                        />
                    </Grid>
                </>
            )
        }
        {
            watch("sign_in_page.type") === "video" && (
                <>
                    <Grid item xs={12}>
                        <FileInput
                            name="sign_in_page.bg_video_data.video"
                            control={control}
                            label="Background Video"
                            accept="video/*"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FileInput
                            name="sign_in_page.bg_video_data.fallback_image"
                            control={control}
                            label="Fallback Image"
                            accept="image/*"
                        />
                    </Grid>
                </>
            )
        }
    </>
);

export default StepTwo;