"use client"

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { TenantCard } from '@/components/TenantCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TenantsPage() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const res = await api.get('/tenants');
                setTenants(res.data);
            } catch (error) {
                console.error("Failed to fetch tenants", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTenants();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">ভাড়াটিয়া</h2>
                    <p className="text-muted-foreground">ভাড়াটিয়াদের তথ্য ম্যানেজ করুন।</p>
                </div>
                <Link href="/tenants/add">
                    <Button size="sm" className="h-10">
                        <Plus className="mr-2 h-4 w-4" /> নতুন ভাড়াটিয়া
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />)}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {tenants.map((tenant: any) => (
                        <motion.div
                            key={tenant._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <TenantCard tenant={tenant} />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
