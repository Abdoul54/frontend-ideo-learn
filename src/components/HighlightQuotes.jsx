import React from 'react';

/**
 * Parses a string and renders styled JSX based on:
 * - "text" => bold
 * - 'text' => italic
 * - `text` => code
 * - _text_ => underline
 * @param {{ text: string }} props
 */
const HighlightQuotes = ({ text }) => {
    const regex = /(".*?"|'.*?'|`.*?`|_.*?_)/g;
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) => {
                if (/^".*"$/.test(part)) {
                    return <strong key={index}>{part.slice(1, -1)}</strong>;
                } else if (/^'.*'$/.test(part)) {
                    return <em key={index}>{part.slice(1, -1)}</em>;
                } else if (/^`.*`$/.test(part)) {
                    return <code key={index} style={{ backgroundColor: '#f5f5f5', padding: '0 4px' }}>{part.slice(1, -1)}</code>;
                } else if (/^_.*_$/.test(part)) {
                    return <u key={index}>{part.slice(1, -1)}</u>;
                } else {
                    return <span key={index}>{part}</span>;
                }
            })}
        </>
    );
};

export default HighlightQuotes;
