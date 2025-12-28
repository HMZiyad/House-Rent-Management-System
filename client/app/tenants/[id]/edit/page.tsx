"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function EditTenantPage() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        roomNumber: '',
        baseRent: '',
        fixedWaterBill: '',
        fixedGasBill: '',
        fixedWasteBill: '',
        // No opening balance editing here, usually set once. 
        // Could allow editing if implemented in backend to find/update that specific bill.
    });

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const res = await api.get(`/tenants/${id}`);
                const data = res.data;
                setFormData({
                    name: data.name,
                    phone: data.phone,
                    roomNumber: data.roomNumber,
                    baseRent: data.baseRent,
                    fixedWaterBill: data.fixedWaterBill || '',
                    fixedGasBill: data.fixedGasBill || '',
                    fixedWasteBill: data.fixedWasteBill || '',
                });
            } catch (error) {
                console.error("Failed to fetch tenant", error);
                alert("Failed to load tenant data");
            } finally {
                setFetching(false);
            }
        };
        if (id) fetchTenant();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/tenants/${id}`, formData);
            router.push(`/tenants/${id}`);
        } catch (error) {
            console.error("Failed to update tenant", error);
            alert("Failed to update tenant");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div>Loading...</div>;

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-2xl font-bold tracking-tight">Edit Tenant</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Update Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">WhatsApp Number</label>
                            <input
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Room Number</label>
                            <input
                                name="roomNumber"
                                value={formData.roomNumber}
                                onChange={handleChange}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Monthly Assessment (Base Rent)</label>
                            <input
                                name="baseRent"
                                type="number"
                                value={formData.baseRent}
                                onChange={handleChange}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <p className="col-span-2 text-sm font-semibold text-gray-500">Fixed Utility Package</p>
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Fixed Water</label>
                                <input
                                    name="fixedWaterBill"
                                    type="number"
                                    value={formData.fixedWaterBill}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Fixed Gas</label>
                                <input
                                    name="fixedGasBill"
                                    type="number"
                                    value={formData.fixedGasBill}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm border-gray-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Fixed Waste</label>
                                <input
                                    name="fixedWasteBill"
                                    type="number"
                                    value={formData.fixedWasteBill}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm border-gray-200"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Tenant'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
