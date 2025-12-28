"use client"

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BillCard } from '@/components/BillCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBills = async () => {
        try {
            const res = await api.get('/bills');
            setBills(res.data);
        } catch (error) {
            console.error("Failed to fetch bills", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
                    <p className="text-muted-foreground">Manage invoices and payments.</p>
                </div>
                <Link href="/billing/create">
                    <Button size="sm" className="h-10">
                        <Plus className="mr-2 h-4 w-4" /> Generate Bill
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-xl" />)}
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {bills.map((bill: any) => (
                        <BillCard key={bill._id} bill={bill} onUpdate={fetchBills} />
                    ))}
                </div>
            )}
        </div>
    );
}
