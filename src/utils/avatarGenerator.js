// Function to generate a color based on the name
export const stringToColor = (string) => {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Ensure the color is dark enough for good contrast with white text
    let r = (hash & 0xFF) % 150; // Limit to 0-149
    let g = ((hash >> 8) & 0xFF) % 150;
    let b = ((hash >> 16) & 0xFF) % 150;

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Function to generate avatar props
export const stringAvatar = (name, sx = {}, icon = null) => {
    if (!name || name.trim() === '') return {};

    const nameParts = name.split(' ');
    let initials = '';

    if (nameParts.length >= 2) {
        initials = `${nameParts[0][0]}${nameParts[1][0]}`;
    } else if (nameParts.length === 1) {
        initials = nameParts[0][0];
    }

    return {
        sx: {
            bgcolor: stringToColor(name),
            color: '#fff',
            ...sx
        },
        children: icon ? <i className={icon} /> : initials,
    };
};
