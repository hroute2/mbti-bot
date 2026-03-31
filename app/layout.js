import './globals.css';
import Header from './components/Header';

export const metadata = {
  title: 'MBTI Bot',
  description: 'MBTI診断・情報閲覧Webアプリ',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6 pb-24 sm:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
