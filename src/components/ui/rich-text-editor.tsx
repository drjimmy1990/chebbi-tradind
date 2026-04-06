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
import { forwardRef } from 'react';

interface RichTextEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
}

export const RichTextEditor = forwardRef<MDXEditorMethods, RichTextEditorProps>(
  ({ markdown, onChange, placeholder, dir = 'ltr' }, ref) => {
    return (
      <div
        className="rounded-xl border border-input bg-card overflow-hidden focus-within:ring-1 focus-within:ring-ring text-foreground [&_.mdxeditor-toolbar]:bg-secondary/50 [&_.mdxeditor-toolbar]:border-b [&_.mdxeditor-toolbar]:border-border [&_.mdxeditor-root]:!font-sans"
        dir={dir}
      >
        <MDXEditor
          ref={ref}
          markdown={markdown}
          onChange={onChange}
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
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
