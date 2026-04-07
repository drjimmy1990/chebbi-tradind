'use client';

import { useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RichTextEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
}

// ─── helpers ────────────────────────────────────────────────────────────────
function insertAround(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  setValue: (v: string) => void,
) {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  const selected = value.slice(s, e);
  const updated = value.slice(0, s) + before + selected + after + value.slice(e);
  setValue(updated);
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(s + before.length, e + before.length);
  }, 0);
}

function insertLine(
  textarea: HTMLTextAreaElement,
  prefix: string,
  setValue: (v: string) => void,
) {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  // Find line start
  const lineStart = value.lastIndexOf('\n', s - 1) + 1;
  const lineEnd = value.indexOf('\n', e);
  const end = lineEnd === -1 ? value.length : lineEnd;
  const line = value.slice(lineStart, end);
  // Toggle: if line already starts with prefix, remove it; else add it
  const already = line.startsWith(prefix);
  const newLine = already ? line.slice(prefix.length) : prefix + line;
  const updated = value.slice(0, lineStart) + newLine + value.slice(end);
  setValue(updated);
  setTimeout(() => {
    textarea.focus();
    const offset = already ? -prefix.length : prefix.length;
    textarea.setSelectionRange(s + offset, e + offset);
  }, 0);
}

// ─── Toolbar Button ──────────────────────────────────────────────────────────
function ToolbarBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="px-2 py-1 rounded text-sm font-medium text-[var(--editor-toolbar-fg)] hover:bg-[var(--editor-toolbar-hover)] transition-colors select-none"
    >
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function RichTextEditor({
  markdown,
  onChange,
  placeholder = 'Write your content here…',
  dir = 'ltr',
}: RichTextEditorProps) {
  const [tab, setTab] = useState<'write' | 'markdown' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const ta = () => textareaRef.current!;

  /* ── toolbar actions ── */
  const bold = useCallback(() => insertAround(ta(), '**', '**', onChange), [onChange]);
  const italic = useCallback(() => insertAround(ta(), '_', '_', onChange), [onChange]);
  const h1 = useCallback(() => insertLine(ta(), '# ', onChange), [onChange]);
  const h2 = useCallback(() => insertLine(ta(), '## ', onChange), [onChange]);
  const h3 = useCallback(() => insertLine(ta(), '### ', onChange), [onChange]);
  const quote = useCallback(() => insertLine(ta(), '> ', onChange), [onChange]);
  const ul = useCallback(() => insertLine(ta(), '- ', onChange), [onChange]);
  const ol = useCallback(() => {
    const textarea = ta();
    const { selectionStart: s, value } = textarea;
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    const lineEnd = value.indexOf('\n', s);
    const end = lineEnd === -1 ? value.length : lineEnd;
    const updated = value.slice(0, lineStart) + '1. ' + value.slice(lineStart, end) + value.slice(end);
    onChange(updated);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(s + 3, s + 3); }, 0);
  }, [onChange]);

  const link = useCallback(() => {
    const textarea = ta();
    const { selectionStart: s, selectionEnd: e, value } = textarea;
    const selected = value.slice(s, e) || 'link text';
    const url = window.prompt('URL:', 'https://');
    if (!url) return;
    const md = `[${selected}](${url})`;
    const updated = value.slice(0, s) + md + value.slice(e);
    onChange(updated);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(s + md.length, s + md.length); }, 0);
  }, [onChange]);

  const hr = useCallback(() => {
    const textarea = ta();
    const { selectionStart: s, value } = textarea;
    const updated = value.slice(0, s) + '\n---\n' + value.slice(s);
    onChange(updated);
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(s + 5, s + 5); }, 0);
  }, [onChange]);

  const handleImageUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const url: string = data.url;
      // Insert at cursor
      const textarea = ta();
      const { selectionStart: s, value } = textarea;
      const md = `![${file.name}](${url})`;
      const updated = value.slice(0, s) + md + value.slice(s);
      onChange(updated);
      setTimeout(() => { textarea.focus(); textarea.setSelectionRange(s + md.length, s + md.length); }, 0);
    } catch {
      alert('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const tabCls = (t: typeof tab) =>
    `px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
      tab === t
        ? 'bg-background text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <>
      {/* CSS vars scoped to editor — safe on both light & dark themes */}
      <style>{`
        .rte-wrap {
          --editor-bg: hsl(var(--card));
          --editor-fg: hsl(var(--card-foreground));
          --editor-border: hsl(var(--border));
          --editor-toolbar-bg: hsl(var(--muted));
          --editor-toolbar-fg: hsl(var(--muted-foreground));
          --editor-toolbar-hover: hsl(var(--accent));
          --editor-placeholder: hsl(var(--muted-foreground));
        }
        .rte-textarea {
          background: var(--editor-bg);
          color: var(--editor-fg);
          font-family: 'Geist Mono', 'Fira Code', monospace;
          font-size: 0.875rem;
          line-height: 1.7;
          resize: vertical;
          outline: none;
          width: 100%;
          min-height: 300px;
          padding: 1rem;
          border: none;
        }
        .rte-textarea::placeholder { color: var(--editor-placeholder); }
        .rte-preview {
          background: var(--editor-bg);
          color: var(--editor-fg);
          min-height: 300px;
          padding: 1rem;
          font-size: 0.9rem;
          line-height: 1.8;
        }
        .rte-preview h1 { font-size: 1.6rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .rte-preview h2 { font-size: 1.3rem; font-weight: 700; margin: 0.9rem 0 0.4rem; }
        .rte-preview h3 { font-size: 1.1rem; font-weight: 600; margin: 0.8rem 0 0.3rem; }
        .rte-preview p  { margin: 0.5rem 0; }
        .rte-preview ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .rte-preview ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .rte-preview li { margin: 0.2rem 0; }
        .rte-preview blockquote {
          border-left: 3px solid hsl(var(--primary));
          padding: 0.4rem 1rem;
          margin: 0.6rem 0;
          color: var(--editor-toolbar-fg);
          font-style: italic;
          background: hsl(var(--muted) / 0.4);
          border-radius: 0 0.4rem 0.4rem 0;
        }
        .rte-preview code {
          background: hsl(var(--muted));
          padding: 0.1em 0.4em;
          border-radius: 0.3rem;
          font-size: 0.85em;
          font-family: monospace;
        }
        .rte-preview pre {
          background: hsl(var(--muted));
          padding: 0.8rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 0.6rem 0;
        }
        .rte-preview pre code { background: none; padding: 0; }
        .rte-preview a { color: hsl(var(--primary)); text-decoration: underline; }
        .rte-preview hr { border: none; border-top: 1px solid var(--editor-border); margin: 1rem 0; }
        .rte-preview img { max-width: 100%; border-radius: 0.5rem; margin: 0.5rem 0; }
        .rte-preview table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; }
        .rte-preview th, .rte-preview td { border: 1px solid var(--editor-border); padding: 0.4rem 0.6rem; text-align: left; }
        .rte-preview th { background: hsl(var(--muted)); font-weight: 600; }
        .rte-preview strong { font-weight: 700; }
        .rte-preview em { font-style: italic; }
      `}</style>

      <div className="rte-wrap rounded-xl border border-border overflow-hidden" dir={dir}>
        {/* ── Toolbar ── */}
        <div
          className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border"
          style={{ background: 'var(--editor-toolbar-bg)' }}
        >
          <ToolbarBtn title="Heading 1" onClick={h1}><span className="font-bold">H1</span></ToolbarBtn>
          <ToolbarBtn title="Heading 2" onClick={h2}><span className="font-bold">H2</span></ToolbarBtn>
          <ToolbarBtn title="Heading 3" onClick={h3}><span className="font-bold">H3</span></ToolbarBtn>
          <span className="w-px h-4 bg-border mx-1" />
          <ToolbarBtn title="Bold" onClick={bold}><strong>B</strong></ToolbarBtn>
          <ToolbarBtn title="Italic" onClick={italic}><em>I</em></ToolbarBtn>
          <span className="w-px h-4 bg-border mx-1" />
          <ToolbarBtn title="Quote" onClick={quote}>❝</ToolbarBtn>
          <ToolbarBtn title="Bullet list" onClick={ul}>• List</ToolbarBtn>
          <ToolbarBtn title="Numbered list" onClick={ol}>1. List</ToolbarBtn>
          <ToolbarBtn title="Horizontal rule" onClick={hr}>―</ToolbarBtn>
          <span className="w-px h-4 bg-border mx-1" />
          <ToolbarBtn title="Insert link" onClick={link}>🔗</ToolbarBtn>
          <ToolbarBtn
            title="Upload image from file"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? '⏳' : '🖼️ Upload'}
          </ToolbarBtn>
          <ToolbarBtn
            title="Insert image by URL"
            onClick={() => {
              const url = window.prompt('Image URL (must start with http:// or https:// or /):', 'https://');
              if (!url) return;
              const textarea = ta();
              const { selectionStart: s, selectionEnd: e, value } = textarea;
              const alt = value.slice(s, e) || 'image';
              const md = `![${alt}](${url})`;
              const updated = value.slice(0, s) + md + value.slice(e);
              onChange(updated);
              setTimeout(() => { textarea.focus(); textarea.setSelectionRange(s + md.length, s + md.length); }, 0);
            }}
          >
            🔗🖼
          </ToolbarBtn>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
              e.target.value = '';
            }}
          />

          {/* ── Tab switcher (right side) ── */}
          <div className="ml-auto flex items-center gap-1 bg-muted/60 rounded-lg p-0.5">
            <button type="button" className={tabCls('write')} onClick={() => setTab('write')}>✏️ Write</button>
            <button type="button" className={tabCls('markdown')} onClick={() => setTab('markdown')}>&lt;/&gt; MD</button>
            <button type="button" className={tabCls('preview')} onClick={() => setTab('preview')}>👁 Preview</button>
          </div>
        </div>

        {/* ── Content area ── */}
        {tab === 'preview' ? (
          <div className="rte-preview overflow-y-auto max-h-[500px]">
            {markdown.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            ) : (
              <p style={{ color: 'var(--editor-placeholder)' }}>Nothing to preview yet. Switch to Write tab and add some content.</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            className="rte-textarea"
            value={markdown}
            onChange={(e) => onChange(e.target.value)}
            placeholder={tab === 'markdown' ? 'Raw markdown…' : placeholder}
            dir={dir}
            spellCheck={tab === 'write'}
          />
        )}
      </div>
    </>
  );
}

export default RichTextEditor;
