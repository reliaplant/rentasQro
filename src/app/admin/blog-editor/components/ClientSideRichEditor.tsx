"use client";

import dynamic from 'next/dynamic';

// Dynamic import with no SSR for the TipTap editor
const RichTextEditor = dynamic(
  () => import('./RichTextEditor'),
  { ssr: false } // This prevents the component from being rendered on the server
);

export default function ClientSideRichEditor(props: any) {
  return <RichTextEditor {...props} />;
}
