import * as yup from 'yup';

export const schema = yup.object().shape({
    sign_in_page: yup.object().shape({
        type: yup.string()
            .oneOf(['color', 'image', 'video'])
            .required(),
            
        background_color: yup.string()
            .when('type', {
                is: (val) => val === 'color',
                then: () => yup.string()
                    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code')
                    .required('Background color is required'),
                otherwise: () => yup.string().nullable()
            }),
            
        bg_data: yup.mixed()
            .when('type', {
                is: (val) => val === 'image',
                then: () => yup.mixed().required('Background image is required'),
                otherwise: () => yup.mixed().nullable()
            }),
            
        bg_video_data: yup.object({
            video: yup.mixed()
                .when('../type', {
                    is: (val) => val === 'video',
                    then: () => yup.mixed().required('Background video is required'),
                    otherwise: () => yup.mixed().nullable()
                }),
            fallback_image: yup.mixed()
                .when('../type', {
                    is: (val) => val === 'video',
                    then: () => yup.mixed().required('Fallback image is required'),
                    otherwise: () => yup.mixed().nullable()
                })
        }).default(() => ({
            video: null,
            fallback_image: null
        }))
    })
});

export const defaultValues = {
    sign_in_page: {
        type: "color",
        background_color: "#FFFFFF",
        bg_data: null,
        bg_video_data: {
            video: null,
            fallback_image: null
        }
    }
};