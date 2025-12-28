"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Home, User } from "lucide-react"
import Link from 'next/link';

interface TenantCardProps {
    tenant: {
        _id: string;
        name: string;
        phone: string;
        roomNumber: string;
        isActive: boolean;
    };
}

export function TenantCard({ tenant }: TenantCardProps) {
    return (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-none shadow-sm bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/30 pb-2 border-b border-border/50">
                <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{tenant.name}</span>
                </div>
                <div className={`h-2.5 w-2.5 rounded-full ${tenant.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500'}`} />
            </CardHeader>
            <CardContent className="pt-4 grid gap-2">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Home className="mr-2 h-4 w-4" />
                    <span>রুম: {tenant.roomNumber}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>{tenant.phone}</span>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-2 grid grid-cols-2 gap-2 border-t border-border/50">
                <Button variant="outline" size="sm" className="w-full text-primary hover:text-primary hover:bg-primary/10 border-primary/20" onClick={() => window.open(`https://wa.me/${tenant.phone.replace(/[^0-9]/g, '')}`, '_blank')}>
                    মেসেজ
                </Button>
                <Link href={`/tenants/${tenant._id}`} className="w-full">
                    <Button size="sm" className="w-full">
                        বিস্তারিত
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
