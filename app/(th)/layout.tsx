import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import { Shell } from '@/components/Shell';
import { buildMetadata, viewportConfig } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata('th');
export const viewport: Viewport = viewportConfig;

export default function ThaiLayout({ children }: { children: React.ReactNode }) {
  return <Shell locale="th">{children}</Shell>;
}
