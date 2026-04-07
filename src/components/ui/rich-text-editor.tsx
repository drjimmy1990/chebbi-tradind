'use client';

import {
  MDXEditor,
  MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  InsertImage,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { forwardRef, useState } from 'react';

interface RichTextEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
}

export const RichTextEditor = forwardRef<MDXEditorMethods, RichTextEditorProps>(
  ({ markdown, onChange, placeholder, dir = 'ltr' }, ref) => {
    // This state holds the container div. We pass it to MDXEditor so its popups 
    // render inside the Dialog, bypassing Radix's body pointer-events block.
    const [container, setContainer] = useState<HTMLDivElement | null>(null);

    return (
      <div
        ref={setContainer}
        className="rounded-xl border border-input bg-card overflow-hidden focus-within:ring-1 focus-within:ring-ring text-foreground relative [&_.mdxeditor-toolbar]:bg-secondary/50 [&_.mdxeditor-toolbar]:border-b [&_.mdxeditor-toolbar]:border-border [&_.mdxeditor-root]:!font-sans"
        dir={dir}
      >
        {/* We only render the editor once the local container is ready. */}
        {container && (
          <MDXEditor
            ref={ref}
            markdown={markdown}
            onChange={onChange}
            overlayContainer={container}
            contentEditableClassName="prose prose-invert max-w-none p-4 min-h-[300px] outline-none focus:outline-none"
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin(),
              linkPlugin(),
              linkDialogPlugin(),
              imagePlugin({
                imageUploadHandler: async (image: File) => {
                  const formData = new FormData();
                  formData.append('file', image);
                  const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  if (!response.ok) {
                    throw new Error('Image upload failed');
                  }
                  const data = await response.json();
                  return data.url;
                }
              }),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    <UndoRedo />
                    <BoldItalicUnderlineToggles />
                    <BlockTypeSelect />
                    <CreateLink />
                    <InsertImage />
                  </>
                ),
              }),
            ]}
            placeholder={placeholder}
          />
        )}
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
