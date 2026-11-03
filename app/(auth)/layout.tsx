import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-surface flex items-center justify-center py-12 px-4">
        {children}
      </main>
      <Footer />
    </>
  );
}
