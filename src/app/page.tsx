import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <header className="flex items-center justify-between px-6 py-4 shadow bg-white">
        <h1 className="text-2xl font-bold text-blue-600">ClientPortal</h1>
        <div className="space-x-2">
          <Link href="/login">
            <Button variant="default">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Register</Button>
          </Link>
        </div>
      </header>

      <section className="flex flex-col items-center justify-center text-center px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900">
          Simplify your client management.
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mb-8">
          Secure, all-in-one portal for managing clients, documents, and tasks. Built for modern teams.
        </p>
        <div className="space-x-4">
          <Link href="/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="default">Login</Button>
          </Link>
        </div>
      </section>

      <footer className="text-center py-6 text-gray-400 text-sm">
        © {new Date().getFullYear()} ClientPortal Inc. All rights reserved.
      </footer>
    </main>
  );
}
