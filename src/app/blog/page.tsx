'use client';

import dynamic from 'next/dynamic';

const App = dynamic(
  () => import('@/components/chebbi/app').then((mod) => ({ default: mod.App })),
  { ssr: false },
);

export default function BlogRoutePage() {
  return <App defaultView="blog" />;
}
