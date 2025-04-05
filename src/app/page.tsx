import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 shadow bg-white">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-600">ClientPortal</h1>
        <div className="space-x-2">
          <Link href="/login">
            <Button variant="outline" size="sm" className="sm:size-default">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="sm:size-default">
              Register
            </Button>
          </Link>
        </div>
      </header>

      <section className="flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-32 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900 leading-tight">
          Simplify your client management.
        </h2>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl mb-8">
          Secure, all-in-one portal for managing clients, documents, and tasks. Built for modern teams.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Login
            </Button>
          </Link>
        </div>
      </section>

      <footer className="text-center py-6 px-4 text-gray-400 text-sm">
        © {new Date().getFullYear()} ClientPortal Inc. All rights reserved.
      </footer>
    </main>
  )
}

