"use client"

import Link from "next/link"
import { Home } from "lucide-react"

export function Navbar() {
    return (
        <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center space-x-2">
                    <div className="bg-primary p-1.5 rounded-xl shadow-sm text-primary-foreground">
                        <Home className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold text-foreground tracking-tight">
                        HouseManager
                    </span>
                </div>
                <div className="hidden md:flex space-x-6 text-sm font-medium text-muted-foreground">
                    <Link href="/" className="hover:text-primary transition-colors">হোম</Link>
                    <Link href="/tenants" className="hover:text-primary transition-colors">ভাড়াটিয়া</Link>
                    <Link href="/reports" className="hover:text-primary transition-colors">রিপোর্ট</Link>
                </div>
            </div>
        </nav>
    )
}
