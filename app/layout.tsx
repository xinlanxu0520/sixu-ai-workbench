import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: '思序 · AI 创作知识工作台', description: '让散落的信息，成为有序的思考。' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
