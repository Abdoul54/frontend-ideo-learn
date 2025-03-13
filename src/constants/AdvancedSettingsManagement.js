// frontend/src/constants/AdvancedSettingsManagement.js
import * as yup from "yup";

export const generateSchema = (metadata) => {
    const schemaShape = {};
    for (const [key, prop] of Object.entries(metadata.properties)) {
        switch (prop.type) {
            case 'enum':
                schemaShape[key] = yup.string().oneOf(prop.values).required();
                break;
            case 'bool':
                schemaShape[key] = yup.boolean().required();
                break;
            case 'int':
                schemaShape[key] = yup.number().integer().required();
                break;
            default:
                schemaShape[key] = yup.string().required();
        }
    }
    return yup.object().shape(schemaShape);
};

export const generateDateSchema = (metadata) => {
    const schemaShape = {};
    for (const [key, prop] of Object.entries(metadata.properties)) {
        switch (key) {
            case 'timezone_default':
                schemaShape[key] = yup.string().required('Timezone is required');
                break;
            case 'date_format':
                schemaShape[key] = yup.string().oneOf(['d/m/Y', 'Y-m-d', 'm/d/Y', 'd-m-Y', 'm-d-Y']).required('Date format is required');
                break;
            case 'date_language':
                schemaShape[key] = yup.string().oneOf(['fr']).required('Language is required');
                break;
            default:
                schemaShape[key] = yup.string().required();
        }
    }
    return yup.object().shape(schemaShape);
};