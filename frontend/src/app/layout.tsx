import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import ToastContainer from '@/components/ui/Toast';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'Duolingo Clone - Spanish',
  description: 'Learn Spanish with the interactive Duolingo fullstack web app clone',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="font-nunito bg-[#FFFFFF] dark:bg-[#131F24] text-[#4B4B4B] dark:text-[#E5E5E5] antialiased transition-colors duration-200">
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}