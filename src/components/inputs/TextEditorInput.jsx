import React, { useState } from 'react';
import { Popover, TextField, Button, Paper, Divider, Tooltip, IconButton } from '@mui/material';
import 'prismjs/themes/prism-tomorrow.css';

import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import { ListItem } from '@tiptap/extension-list-item';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import Blockquote from '@tiptap/extension-blockquote';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';  // Import Link extension
import { all, createLowlight } from 'lowlight';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const lowlight = createLowlight(all);

const ToolbarButton = ({ icon, label, action, isActive, disabled }) => (
    <Tooltip title={label} arrow>
        <span>
            <IconButton
                onClick={action}
                disabled={disabled}
                color={isActive ? 'primary' : 'default'}
                size='small'
            >
                <i className={`${icon}`} />
            </IconButton>
        </span>
    </Tooltip>
);

const EditorToolbar = () => {
    const { editor } = useCurrentEditor();
    if (!editor) return null;

    const [imageAnchorEl, setImageAnchorEl] = useState(null);
    const [imageUrl, setImageUrl] = useState('');


    const [anchorEl, setAnchorEl] = useState(null);
    const [url, setUrl] = useState('');
    const [selection, setSelection] = useState(null);

    const openPopover = Boolean(anchorEl);

    const handleImageClick = (event) => {
        setImageAnchorEl(event.currentTarget);
    };

    const handleInsertImageUrl = () => {
        if (imageUrl.trim()) {
            editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
        }
        setImageAnchorEl(null);
        setImageUrl('');
    };

    const handleUploadImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result;
                editor.chain().focus().setImage({ src: base64Image }).run();
            };
            reader.onerror = () => alert('Error converting file to base64');
            reader.readAsDataURL(file);
        });

        input.click();
        setImageAnchorEl(null);
    };

    const handleLinkClick = (event) => {
        if (!editor) return;

        const previousUrl = editor.getAttributes('link').href || '';
        setUrl(previousUrl);
        setSelection(editor.state.selection);
        setAnchorEl(event.currentTarget);
    };

    return (
        <div className='flex items-center flex-wrap gap-1 p-2 border-b'>
            <ToolbarButton
                icon="ri-bold"
                label='Bold'
                action={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                disabled={!editor.can().chain().focus().toggleBold().run()}
            />
            <ToolbarButton
                icon="ri-italic"
                label='Italic'
                action={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
            />
            <ToolbarButton
                icon="ri-strikethrough"
                label='Strikethrough'
                action={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
            />
            <ToolbarButton
                icon="ri-code-fill"
                label='Code'
                action={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                disabled={!editor.can().chain().focus().toggleCode().run()}
            />

            <Divider orientation='vertical' flexItem className='mx-2' />

            <ToolbarButton
                icon="ri-h-1"
                label='Heading 1'
                action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
            />
            <ToolbarButton
                icon="ri-h-2"
                label='Heading 2'
                action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
            />
            <ToolbarButton
                icon="ri-h-3"
                label='Heading 3'
                action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
            />

            <Divider orientation='vertical' flexItem className='mx-2' />

            <ToolbarButton
                icon="ri-align-left"
                label='Align Left'
                action={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
            />
            <ToolbarButton
                icon="ri-align-center"
                label='Align Center'
                action={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
            />
            <ToolbarButton
                icon="ri-align-right"
                label='Align Right'
                action={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
            />

            <Divider orientation='vertical' flexItem className='mx-2' />

            <ToolbarButton
                icon="ri-list-unordered"
                label='Bullet List'
                action={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
            />
            <ToolbarButton
                icon="ri-list-ordered"
                label='Numbered List'
                action={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
            />

            <Divider orientation='vertical' flexItem className='mx-2' />

            <ToolbarButton
                icon="ri-image-fill"
                label="Insert Image"
                action={handleImageClick}
            />

            <Divider orientation='vertical' flexItem className='mx-2' />

            <ToolbarButton
                icon="ri-link"
                label='Insert/Edit Link'
                action={handleLinkClick}
            />

            <Divider orientation='vertical' flexItem className='mx-2' />

            <ToolbarButton
                icon="ri-arrow-go-back-fill"
                label='Undo'
                action={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
            />
            <ToolbarButton
                icon="ri-arrow-go-forward-fill"
                label='Redo'
                action={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
            />
            <Popover
                open={Boolean(imageAnchorEl)}
                anchorEl={imageAnchorEl}
                onClose={() => {
                    setImageAnchorEl(null);
                    setImageUrl('');
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, width: 300 }}>
                    <TextField
                        label="Image URL"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        size="small"
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleInsertImageUrl}
                            disabled={!imageUrl.trim()}
                        >
                            Insert
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleUploadImage}
                        >
                            Upload File
                        </Button>
                    </div>
                </div>
            </Popover>

        </div>
    );
};

const extensions = [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle,
    StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        heading: { levels: [1, 2, 3] },
        codeBlock: false, // we override this
    }),
    Heading.configure({ levels: [1, 2, 3] }),
    Placeholder.configure({ placeholder: 'Write something here...' }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Blockquote,
    HorizontalRule,
    CodeBlockLowlight.configure({ lowlight }),
    Image,
    Link.configure({
        openOnClick: false, // ← This disables link navigation inside the editor
        autolink: false, // Optional: prevents automatic link detection
        linkOnPaste: false // Optional: stops auto-linking pasted URLs
    }),
];

const TextEditorInput = ({ content, onUpdate, sx }) => {
    return (
        <Paper
            elevation={0}
            variant="outlined"
            square
            sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                padding: 0,
                bgcolor: 'background.paper',
                '& .ProseMirror': {
                    minHeight: '200px',
                    padding: 6,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '0.4em',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'var(--mui-palette-background-paper)',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'var(--mui-palette-primary-main)',
                        borderRadius: 2,
                    },
                    '& img': {
                        maxWidth: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                    },
                },
                '& .ProseMirror-focused': {
                    outline: 'none',
                },
                ...sx,
            }}
        >
            <EditorProvider
                slotBefore={
                    <>
                        <EditorToolbar />
                        <Divider />
                    </>
                }
                extensions={extensions}
                content={content}
                onUpdate={({ editor }) => {
                    const html = editor.getHTML();
                    onUpdate(html);
                }}
            />
        </Paper>
    );
};

export default TextEditorInput;
