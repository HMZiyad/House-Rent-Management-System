"use client"

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, CheckCircle, Clock } from "lucide-react"
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface BillCardProps {
    bill: any;
    onUpdate: () => void;
}

export function BillCard({ bill, onUpdate }: BillCardProps) {
    const [loading, setLoading] = useState(false);

    const handleSendInvoice = async () => {
        try {
            setLoading(true);
            await api.post('/notifications/send-invoice', { billId: bill._id });
            alert('Invoice sent via WhatsApp!');
        } catch (error) {
            console.error("Failed to send invoice", error);
            alert('Failed to send invoice');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async () => {
        try {
            setLoading(true);
            // Mark fully paid
            await api.put(`/bills/${bill._id}`, {
                paidAmount: bill.totalAmount,
                status: 'Paid',
                paymentDate: new Date()
            });
            onUpdate();
        } catch (error) {
            console.error("Failed to update bill", error);
            alert('Failed to update bill');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gray-50 pb-2 dark:bg-gray-900 border-b">
                <div className="font-semibold">{bill.tenant?.name || 'Unknown Tenant'}</div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${bill.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        bill.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                    }`}>
                    {bill.status}
                </div>
            </CardHeader>
            <CardContent className="pt-4 grid gap-1">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Month:</span>
                    <span>{bill.month} {bill.year}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rent:</span>
                    <span>{formatCurrency(bill.rentAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Utilities:</span>
                    <span>{formatCurrency(bill.totalAmount - bill.rentAmount)}</span>
                </div>
                <div className="mt-2 flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(bill.totalAmount)}</span>
                </div>
                {bill.dueAmount > 0 && (
                    <div className="flex justify-between text-sm text-red-600 font-medium">
                        <span>Due:</span>
                        <span>{formatCurrency(bill.dueAmount)}</span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="bg-gray-50/50 p-2 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="w-full text-green-600" onClick={handleSendInvoice} disabled={loading}>
                    <MessageCircle className="mr-2 h-4 w-4" /> Send Invoice
                </Button>
                {bill.status !== 'Paid' && (
                    <Button size="sm" className="w-full" onClick={handleMarkPaid} disabled={loading}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Paid
                    </Button>
                )}
                {bill.status === 'Paid' && (
                    <Button variant="ghost" size="sm" className="w-full text-gray-400" disabled>
                        <Clock className="mr-2 h-4 w-4" /> Paid on {new Date(bill.paymentDate).toLocaleDateString()}
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
