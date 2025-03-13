'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Alert, Card, CardContent, CardHeader } from '@mui/material';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-[900px] w-full animate-pulse bg-gray-200 rounded-md"></div>
  ),
});

const CustomCssEditor = ({ 
  value = '', 
  onChange,
  title = 'Custom CSS',
  height = '900px'
}) => {
  const [error, setError] = useState(null);

  const handleEditorChange = (newValue) => {
    // Basic CSS validation
    try {
      const styleSheet = new CSSStyleSheet();
      styleSheet.replaceSync(newValue);
      setError(null);
      onChange?.(newValue);
    } catch (err) {
      setError(err.message);
    }
  };

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineHeight: 21,
    padding: { top: 16 },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    wrappingStrategy: 'advanced',
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
    },
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title={title} />
      <CardContent>
        <div className="text-sm text-gray-500 mb-4">
          Customize the appearance of your application using CSS.
        </div>
        <div className="space-y-4">
          <div 
            className="border rounded-md overflow-hidden"
            style={{ height }}
          >
            <MonacoEditor
              defaultValue={value}
              onChange={handleEditorChange}
              language="css"
              theme="vs-light"
              options={editorOptions}
              className="min-h-full"
            />
          </div>
          
          {/* {error && (
            <Alert variant="destructive">
                CSS Error: {error}
            </Alert>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomCssEditor;