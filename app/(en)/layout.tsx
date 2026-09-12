import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import { Shell } from '@/components/Shell';
import { buildMetadata, viewportConfig } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata('en');
export const viewport: Viewport = viewportConfig;

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <Shell locale="en">{children}</Shell>;
}
