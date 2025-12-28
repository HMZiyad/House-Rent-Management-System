"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function AddTenantPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '', // Should include country code
        roomNumber: '',
        familyMembers: '',
        baseRent: '',
        fixedWaterBill: '',
        fixedGasBill: '',
        fixedWasteBill: '',
        openingBalance: '',
        joinDate: new Date().toISOString().split('T')[0]
    });

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
            await api.post('/tenants', formData);
            router.push('/tenants');
        } catch (error) {
            console.error("Failed to add tenant", error);
            alert("Failed to add tenant");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-2xl font-bold tracking-tight">Add New Tenant</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tenant Information</CardTitle>
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
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="John Doe"
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
                                placeholder="+88017..."
                            />
                            <p className="text-xs text-muted-foreground">Include country code (e.g. +880)</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Room Number</label>
                                <input
                                    name="roomNumber"
                                    value={formData.roomNumber}
                                    onChange={handleChange}
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="A-101"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Family Members</label>
                                <input
                                    name="familyMembers"
                                    type="number"
                                    value={formData.familyMembers}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="1"
                                />
                            </div>
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
                                placeholder="15000"
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
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Fixed Gas</label>
                                <input
                                    name="fixedGasBill"
                                    type="number"
                                    value={formData.fixedGasBill}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Fixed Waste</label>
                                <input
                                    name="fixedWasteBill"
                                    type="number"
                                    value={formData.fixedWasteBill}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 border-t pt-4">
                            <label className="text-sm font-medium text-red-600">Previous Dues / Arrears (Optional)</label>
                            <input
                                name="openingBalance"
                                type="number"
                                value={formData.openingBalance}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm ring-offset-background placeholder:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                placeholder="Amount to be collected"
                            />
                            <p className="text-xs text-muted-foreground">This will create an initial unpaid bill.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Join Date</label>
                            <input
                                name="joinDate"
                                type="date"
                                value={formData.joinDate}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Tenant'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
