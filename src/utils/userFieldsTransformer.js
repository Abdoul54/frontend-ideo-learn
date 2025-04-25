export function userFieldsTransformer(userFields) {
    return userFields.reduce((result, field) => {
        result[field.id] = '';
        return result;
    }, {});
}