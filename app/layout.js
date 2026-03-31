import './globals.css';
import Header from './components/Header';

export const metadata = {
  title: 'MBTI Bot',
  description: 'MBTI診断・情報閲覧Webアプリ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
