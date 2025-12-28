"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash, Plus, FileText, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function TenantProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [tenant, setTenant] = useState<any>(null);
    const [bills, setBills] = useState<any[]>([]);
    const [totalDue, setTotalDue] = useState(0);
    const [loading, setLoading] = useState(true);

    // Billing Form State
    const [showBillForm, setShowBillForm] = useState(false);
    const [billData, setBillData] = useState({
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        electricityBill: ''
    });
    const [creatingBill, setCreatingBill] = useState(false);

    const fetchTenantData = async () => {
        try {
            setLoading(true);
            const [tenantRes, billsRes] = await Promise.all([
                api.get(`/tenants/${id}`),
                api.get(`/bills?tenantId=${id}`)
            ]);

            setTenant(tenantRes.data);
            setBills(billsRes.data);

            // Calculate total due
            const due = billsRes.data.reduce((acc: number, bill: any) => acc + (bill.dueAmount || 0), 0);
            setTotalDue(due);

        } catch (error) {
            console.error("Failed to fetch tenant data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchTenantData();
    }, [id]);

    const handleDelete = async () => {
        if (confirm('Are you sure you want to deactivate this tenant?')) {
            try {
                await api.delete(`/tenants/${id}`);
                router.push('/tenants');
            } catch (error) {
                console.error("Failed to delete tenant", error);
                alert("Failed to delete tenant");
            }
        }
    };

    const handleCreateBill = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingBill(true);
        try {
            // Construct bill payload with fixed rates from tenant and manual electricity
            const payload = {
                tenantId: id,
                month: billData.month,
                year: billData.year,
                electricityBill: billData.electricityBill,
                // Fixed rates from tenant profile
                waterBill: tenant.fixedWaterBill,
                gasBill: tenant.fixedGasBill,
                wasteBill: tenant.fixedWasteBill
            };

            await api.post('/bills', payload);
            setShowBillForm(false);
            setBillData({ ...billData, electricityBill: '' }); // reset only variable
            fetchTenantData(); // refresh bills
        } catch (error) {
            console.error("Failed to create bill", error);
            alert("Failed to create bill");
        } finally {
            setCreatingBill(false);
        }
    };

    const handleSendInvoice = async (billId: string) => {
        try {
            // This would call the backend to send/log invoice
            // For now we can also just open WhatsApp directly
            // But adhering to the requested "Send Invoice" button logic:
            await api.post('/notifications/send-invoice', { billId });
            alert("Invoice Sent (Mocked)!");
        } catch (error) {
            console.error("Failed to send invoice", error);
        }
    };



    // Payment Modal State
    const [paymentModal, setPaymentModal] = useState({
        isOpen: false,
        billId: '',
        billAmount: 0,
        currentPaid: 0,
        dueAmount: 0
    });
    const [payAmount, setPayAmount] = useState('');

    const openPaymentModal = (bill: any) => {
        setPaymentModal({
            isOpen: true,
            billId: bill._id,
            billAmount: bill.totalAmount,
            currentPaid: bill.paidAmount || 0,
            dueAmount: bill.dueAmount
        });
        setPayAmount(bill.dueAmount.toString()); // Default to paying full due
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(payAmount);
        if (amount <= 0) return alert("Enter valid amount");

        const newPaidTotal = paymentModal.currentPaid + amount;

        try {
            // 1. Update Bill (Partial or Full)
            // Backend will calculate new due based on paidAmount
            await api.patch(`/bills/${paymentModal.billId}`, {
                paidAmount: newPaidTotal,
                // Status logic typically handled by backend, but we can hint if fully paid
                // But let backend decide status based on math
            });

            // 2. Send Receipt
            try {
                await api.post('/notifications/send-receipt', {
                    billId: paymentModal.billId,
                    receivedAmount: amount
                });
                alert("Payment Recorded & Receipt Sent!");
            } catch (err) {
                console.error("Receipt send failed", err);
                alert("Payment recorded, but receipt failed.");
            }

            setPaymentModal({ ...paymentModal, isOpen: false });
            fetchTenantData();
        } catch (error) {
            console.error("Failed to record payment", error);
            alert("Failed to record payment");
        }
    };

    const handleMarkPaid = async (billId: string) => {
        if (!confirm("Mark this bill as fully paid?")) return;
        try {
            await api.patch(`/bills/${billId}`, { status: 'Paid' });

            // Send Receipt (Full Amount)
            try {
                await api.post('/notifications/send-receipt', { billId });
                alert("Bill marked as Paid & Receipt Sent!");
            } catch (err) {
                console.error("Receipt send failed", err);
                alert("Bill paid, but receipt failed to send.");
            }

            fetchTenantData();
        } catch (error) {
            console.error("Failed to update bill", error);
        }
    };

    // General Payment Modal State
    const [generalPayModal, setGeneralPayModal] = useState({
        isOpen: false,
        amount: ''
    });

    const handleGeneralPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(generalPayModal.amount);
        if (amount <= 0) return alert("Enter valid amount");

        try {
            // 1. Record Payment (Distribute across bills)
            const res = await api.post(`/tenants/${id}/pay`, { amount });

            // 2. Send Receipt (Using the latest bill touched)
            if (res.data.latestBillId) {
                try {
                    await api.post('/notifications/send-receipt', {
                        billId: res.data.latestBillId,
                        receivedAmount: amount
                    });
                    alert(`Payment Recorded! ${res.data.updatedBillsCount} bills updated. Receipt Sent.`);
                } catch (err) {
                    console.error("Receipt send failed", err);
                    alert(`Payment Recorded, but receipt failed.`);
                }
            } else {
                alert("Payment Recorded! (No unpaid bills found to apply against)");
            }

            setGeneralPayModal({ isOpen: false, amount: '' });
            fetchTenantData();
        } catch (error: any) {
            console.error("Failed to record general payment", error);
            alert(error.response?.data?.message || "Failed to record payment");
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (!tenant) return <div className="p-4">Tenant not found</div>;

    return (
        <div className="space-y-6 max-w-lg mx-auto pb-20 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/tenants')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-2xl font-bold tracking-tight">Tenant Profile</h2>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/tenants/${id}/edit`}>
                        <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button variant="destructive" size="icon" onClick={handleDelete}>
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Tenant Details Card */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl">{tenant.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold">Rm: {tenant.roomNumber}</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${tenant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {tenant.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Members</p>
                            <p className="font-medium">{tenant.familyMembers || 1}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Base Rent</p>
                            <p className="font-medium">{formatCurrency(tenant.baseRent)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Joined</p>
                            <p className="font-medium">{new Date(tenant.joinDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total Dues</p>
                            <p className={`font-bold ${totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(totalDue)}
                            </p>
                        </div>
                    </div>

                    {/* Fixed Package Summary */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-xs space-y-1">
                        <p className="font-semibold text-gray-500">Fixed Assessment</p>
                        <div className="flex justify-between">
                            <span>Water: {formatCurrency(tenant.fixedWaterBill || 0)}</span>
                            <span>Gas: {formatCurrency(tenant.fixedGasBill || 0)}</span>
                            <span>Waste: {formatCurrency(tenant.fixedWasteBill || 0)}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => window.open(`https://wa.me/${tenant.phone.replace(/[^0-9]/g, '')}`, '_blank')}>
                            WhatsApp
                        </Button>
                        <Button className="flex-1" onClick={() => setGeneralPayModal({ ...generalPayModal, isOpen: true })}>
                            Receive Money
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Generate Bill Section */}
            <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Billing</CardTitle>
                    <Button size="sm" onClick={() => setShowBillForm(!showBillForm)}>
                        {showBillForm ? 'Cancel' : 'New Bill'} <Plus className="ml-1 h-4 w-4" />
                    </Button>
                </CardHeader>
                {showBillForm && (
                    <CardContent>
                        <form onSubmit={handleCreateBill} className="space-y-3 bg-gray-50 p-4 rounded-md border">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium">Month</label>
                                    <select
                                        className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm"
                                        value={billData.month}
                                        onChange={(e) => setBillData({ ...billData, month: e.target.value })}
                                    >
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium">Year</label>
                                    <input
                                        type="number"
                                        className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm"
                                        value={billData.year}
                                        onChange={(e) => setBillData({ ...billData, year: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Electricity Bill (Variable)</label>
                                <input
                                    type="number"
                                    placeholder="Reading Amount"
                                    className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm"
                                    value={billData.electricityBill}
                                    onChange={(e) => setBillData({ ...billData, electricityBill: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={creatingBill}>
                                {creatingBill ? 'Generating...' : 'Generate & Save'}
                            </Button>
                        </form>
                    </CardContent>
                )}
            </Card>

            {/* Billing History */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold px-1">History</h3>
                {bills.length === 0 ? (
                    <p className="text-muted-foreground text-sm px-1">No bills found.</p>
                ) : (
                    bills.map(bill => (
                        <Card key={bill._id} className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold">{bill.month} {bill.year}</p>
                                        <p className="text-xs text-muted-foreground">Generated: {new Date(bill.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{formatCurrency(bill.totalAmount)}</p>
                                        {bill.status === 'Paid' ? (
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">PAID</span>
                                        ) : (
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded block">DUE: {formatCurrency(bill.dueAmount)}</span>
                                                {bill.paidAmount > 0 && <span className="text-[10px] text-gray-500">Paid: {formatCurrency(bill.paidAmount)}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-3">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleSendInvoice(bill._id)}>
                                        <FileText className="h-3 w-3 mr-1" /> Invoice
                                    </Button>
                                    {bill.status !== 'Paid' && (
                                        <>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 w-20" onClick={() => handleMarkPaid(bill._id)}>
                                                <CheckCircle className="h-3 w-3 mr-1" /> Paid
                                            </Button>
                                            <Button size="sm" variant="secondary" className="w-20" onClick={() => openPaymentModal(bill)}>
                                                Partial
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Bill Specific Payment Modal (Recycled) */}
            {paymentModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-sm">
                        <CardHeader>
                            <CardTitle>Record Partial Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleRecordPayment} className="space-y-4">
                                <div className="p-3 bg-gray-50 rounded text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span>Total Bill:</span>
                                        <span className="font-medium">{formatCurrency(paymentModal.billAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Already Paid:</span>
                                        <span className="font-medium">{formatCurrency(paymentModal.currentPaid)}</span>
                                    </div>
                                    <div className="flex justify-between text-red-600 font-bold border-t pt-1 mt-1">
                                        <span>Due Amount:</span>
                                        <span>{formatCurrency(paymentModal.dueAmount)}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Payment Amount</label>
                                    <input
                                        type="number"
                                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        value={payAmount}
                                        onChange={(e) => setPayAmount(e.target.value)}
                                        max={paymentModal.dueAmount}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setPaymentModal({ ...paymentModal, isOpen: false })}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                                        Confirm
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* General Payment Modal */}
            {generalPayModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-sm">
                        <CardHeader>
                            <CardTitle>Receive General Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleGeneralPayment} className="space-y-4">
                                <div className="p-4 bg-blue-50 text-blue-800 rounded text-sm mb-4">
                                    <p>This amount will be automatically applied to the oldest unpaid bills first.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Amount Received</label>
                                    <input
                                        type="number"
                                        placeholder="e.g 5000"
                                        className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        value={generalPayModal.amount}
                                        onChange={(e) => setGeneralPayModal({ ...generalPayModal, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setGeneralPayModal({ ...generalPayModal, isOpen: false })}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                        Confirm Receipt
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
