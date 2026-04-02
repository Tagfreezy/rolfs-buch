import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import ChatAssistant from './components/ChatAssistant';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Rolfs UFO-Forschungsarchiv",
  description: '744 Kapitel, 40 Jahre Forschung. Das Lebenswerk von Rolf Burgermeister.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${inter.variable} ${lora.variable} font-sans`}>
        {children}
        <ChatAssistant />
      </body>
    </html>
  );
}
