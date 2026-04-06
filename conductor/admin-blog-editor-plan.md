# Admin Panel Markdown Editor Implementation Plan

## Background & Motivation
Currently, blog posts in the system require writing raw HTML across three languages (French, English, Arabic). This process is manual, tedious, and prone to formatting errors. To make adding and managing posts intuitive and seamless, we will integrate a visual Markdown editor directly into the Admin Dashboard.

## Scope & Impact
1.  **Data Format Transition**: Shift the source of truth for `BlogArticle` content columns (`contentFr`, `contentEn`, `contentAr`) from raw HTML to Markdown.
2.  **Admin UI Update**: Replace standard textareas in the Admin Blog management form with a fully-featured Markdown/Rich Text Editor (leveraging the already installed `@mdxeditor/editor` package).
3.  **Frontend Rendering**: Update the public blog rendering logic to parse and render Markdown safely instead of injecting raw HTML using `dangerouslySetInnerHTML`.
4.  **Dependencies**: We will install `@tailwindcss/typography` to beautifully style the rendered Markdown content automatically, and `turndown` for a one-time migration script.

## Proposed Solution

### Step 1: Frontend Markdown Renderer
- Create a `MarkdownRenderer` component in `src/components/` that uses `react-markdown` (already in `package.json`).
- Configure standard components inside the renderer to map Markdown elements (headings, paragraphs, links, images) to your existing Tailwind-styled components.
- Install `@tailwindcss/typography` to leverage the `prose` class for elegant, out-of-the-box typography scaling and spacing.
- Update `src/app/blog/[slug]/page.tsx` (or the equivalent detailed view) to use the `MarkdownRenderer` instead of injecting HTML.

### Step 2: Admin Dashboard Editor Integration
- Create a reusable `RichTextEditor` component in `src/components/ui/` wrapping `@mdxeditor/editor`.
- Implement toolbar features: bold, italic, headings, lists, links, and image insertion.
- Update the Admin panel's "Create Article" and "Edit Article" forms to use this new component for the three language content fields.
- Ensure the editor handles RTL (Right-to-Left) text gracefully for the Arabic content field.

### Step 3: Image Upload Infrastructure (Optional but Recommended)
- Create a dedicated API route (`src/app/api/upload/route.ts`) to handle image uploads directly from the Markdown Editor.
- Configure the editor to intercept image drops/pastes, upload them to this endpoint, and insert the returned URL into the Markdown string.

### Step 4: Existing Content Migration
- Create a one-time utility script (`scripts/migrate-html-to-md.js`) using the `turndown` library to convert existing HTML blog posts in the Prisma database into Markdown format.
- Run the script to unify all content under the new Markdown standard.

## Alternatives Considered
- **Keeping HTML & using a WYSIWYG editor (e.g., Quill)**: While WYSIWYG editors are easy to use, they often output messy, inline-styled HTML that is hard to style consistently across dark/light modes. Markdown is cleaner, semantic, and safer.
- **Headless CMS (Sanity/Strapi)**: Dismissed as the user requested to keep the posts integrated into the current system via the Admin Panel.

## Verification & Testing
1.  **Authoring**: Verify that creating a new post via the Admin Dashboard correctly saves clean Markdown to the database for all three languages.
2.  **Rendering**: Verify that the blog frontend successfully parses the Markdown and applies typography styles correctly, including complex elements like nested lists and images.
3.  **Migration**: Verify that all previously existing HTML posts look correct after being converted to Markdown.

## Migration & Rollback
- Before running the `turndown` migration script, we will backup the database (`prisma/db/custom.db`).
- If rendering issues occur with old posts, we can restore the backup and adjust the migration script to handle edge cases in the legacy HTML.
