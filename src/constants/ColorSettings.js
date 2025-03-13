import * as yup from 'yup';

export const schema = yup.object().shape({
    colors: yup.object().shape({
        background_color: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Background color is required'),
        icon_color: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Icon color is required'),
        primary: yup.object().shape({
            main: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Primary main color is required'),
            light: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Primary light color is required'),
            dark: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Primary dark color is required')
        }),
        secondary: yup.object().shape({
            main: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Secondary main color is required'),
            light: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Secondary light color is required'),
            dark: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Secondary dark color is required')
        }),
        error: yup.object().shape({
            main: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Error main color is required'),
            light: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Error light color is required'),
            dark: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Error dark color is required')
        }),
        warning: yup.object().shape({
            main: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Warning main color is required'),
            light: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Warning light color is required'),
            dark: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Warning dark color is required')
        }),
        info: yup.object().shape({
            main: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Info main color is required'),
            light: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Info light color is required'),
            dark: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Info dark color is required')
        }),
        success: yup.object().shape({
            main: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Success main color is required'),
            light: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Success light color is required'),
            dark: yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code').required('Success dark color is required')
        })
    })
});

export const defaultValues = {
    colors: {
        background_color: "#FFFFFF",
        icon_color: "#000000",
        primary: {
            main: "#1976D2",
            light: "#BBDEFB",
            dark: "#0D47A1"
        },
        secondary: {
            main: "#9C27B0",
            light: "#E1BEE7",
            dark: "#6A1B9A"
        },
        error: {
            main: "#D32F2F",
            light: "#FFCDD2",
            dark: "#B71C1C"
        },
        warning: {
            main: "#FBC02D",
            light: "#FFF9C4",
            dark: "#F57F17"
        },
        info: {
            main: "#0288D1",
            light: "#B3E5FC",
            dark: "#01579B"
        },
        success: {
            main: "#388E3C",
            light: "#C8E6C9",
            dark: "#1B5E20"
        }
    }
};