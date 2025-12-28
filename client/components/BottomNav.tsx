"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Receipt, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
    const pathname = usePathname()

    const links = [
        { href: "/", label: "হোম", icon: Home },
        { href: "/tenants", label: "ভাড়াটিয়া", icon: Users },
        { href: "/reports", label: "রিপোর্ট", icon: FileText },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background/95 backdrop-blur-sm pb-safe md:hidden shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
            {links.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href
                return (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors hover:text-primary",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                    </Link>
                )
            })}
        </div>
    )
}
