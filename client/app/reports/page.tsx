'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, FileDown, Calendar, User, Users } from 'lucide-react';

interface Tenant {
    _id: string;
    name: string;
    roomNumber: string;
}

interface ReportSummary {
    totalRevenue: number;
    totalCollected: number;
    totalDue: number;
    totalUtility: number;
}

interface ReportRow {
    name: string;
    roomNumber: string;
    status: string;
    rentAmount: number;
    totalUtility: number;
    totalDue: number;
    totalPaid: number;
    totalAmount: number;
}

interface Transaction {
    date: string;
    amount: number;
}

interface ReportData {
    period: string;
    tenants: ReportRow[];
    transactions?: Transaction[];
    summary: ReportSummary;
}

export default function ReportsPage() {
    const [reportType, setReportType] = useState<'overall' | 'tenant'>('overall');
    const [selectedTenant, setSelectedTenant] = useState<string>('');
    const [month, setMonth] = useState<string>(new Date().toLocaleString('default', { month: 'long' }));
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/tenants');
            if (res.data && Array.isArray(res.data)) {
                setTenants(res.data.filter((t: any) => t.isActive));
            }
        } catch (error) {
            console.error('Error fetching tenants:', error);
        }
    };

    const generateReport = async () => {
        if (reportType === 'tenant' && !selectedTenant) {
            alert('Please select a tenant');
            return;
        }

        setGenerating(true);
        try {
            const params: any = { month, year };
            if (reportType === 'tenant') {
                params.tenantId = selectedTenant;
            }

            const res = await axios.get('http://localhost:5000/api/reports/monthly', { params });
            const data: ReportData = res.data;

            generatePDF(data);
        } catch (error: any) {
            console.error('Error generating report:', error);
            alert(`Failed to generate report: ${error.response?.data?.message || error.message}`);
        } finally {
            setGenerating(false);
        }
    };

    const generatePDF = (data: ReportData) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.text('Monthly Property Report', 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Period: ${data.period}`, 14, 30);

        if (reportType === 'tenant') {
            doc.text(`Tenant Report for: ${data.tenants[0]?.name}`, 14, 36);
        } else {
            doc.text(`Type: Overall Report`, 14, 36);
        }

        // Table
        const tableColumn = ["Room", "Tenant", "Status", "Rent", "Utility", "Total Due", "Paid", "Total"];
        const tableRows: (string | number)[][] = [];

        data.tenants.forEach(item => {
            const rowData = [
                item.roomNumber,
                item.name,
                item.status,
                item.rentAmount.toLocaleString(),
                item.totalUtility.toLocaleString(),
                item.totalDue.toLocaleString(),
                item.totalPaid.toLocaleString(),
                item.totalAmount.toLocaleString()
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] },
            styles: { fontSize: 10, cellPadding: 3 },
        });

        // Payment History for Tenant Report
        if (reportType === 'tenant' && data.transactions && data.transactions.length > 0) {
            const historyY = (doc as any).lastAutoTable.finalY + 10;
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Payment History', 14, historyY);

            const historyRows = data.transactions.map((tx: any) => [
                new Date(tx.date).toLocaleDateString(),
                tx.amount.toLocaleString()
            ]);

            autoTable(doc, {
                head: [['Date', 'Amount Paid']],
                body: historyRows,
                startY: historyY + 5,
                theme: 'striped',
                headStyles: { fillColor: [100, 100, 100] },
                styles: { fontSize: 10 },
            });
        }

        // Summary Section
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Financial Summary', 14, finalY);

        doc.setFontSize(11);
        doc.text(`Total Revenue (Calculated): ${data.summary.totalRevenue.toLocaleString()}`, 14, finalY + 8);
        doc.text(`Total Collected: ${data.summary.totalCollected.toLocaleString()}`, 14, finalY + 14);
        doc.text(`Total Outstanding: ${data.summary.totalDue.toLocaleString()}`, 14, finalY + 20);
        doc.text(`Total Utility Expenses: ${data.summary.totalUtility.toLocaleString()}`, 14, finalY + 26);

        doc.text(`Net Income: ${(data.summary.totalCollected - data.summary.totalUtility).toLocaleString()}`, 14, finalY + 34);

        // Footer date
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 280);

        doc.save(`${data.period.replace(' ', '_')}_Report.pdf`);
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">রিপোর্ট তৈরি করুন</h1>
                <p className="text-muted-foreground">হিসাব-নিকাশের জন্য প্রতি মাসের রিপোর্ট নামিয়ে নিন।</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            রিপোর্ট সেটিংস
                        </CardTitle>
                        <CardDescription>কবেকার এবং কী ধরনের রিপোর্ট চান?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">মাস</label>
                                <select
                                    className="w-full p-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                >
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">বছর</label>
                                <select
                                    className="w-full p-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">রিপোর্টের ধরন</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Button
                                    variant={reportType === 'overall' ? 'default' : 'outline'}
                                    onClick={() => setReportType('overall')}
                                    className="w-full justify-start h-auto py-2 px-3"
                                >
                                    <Users className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">সবাইর রিপোর্ট</span>
                                </Button>
                                <Button
                                    variant={reportType === 'tenant' ? 'default' : 'outline'}
                                    onClick={() => setReportType('tenant')}
                                    className="w-full justify-start h-auto py-2 px-3"
                                >
                                    <User className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">ভাড়াটিয়ার রিপোর্ট</span>
                                </Button>
                            </div>
                        </div>

                        {reportType === 'tenant' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label className="text-sm font-medium">ভাড়াটিয়া সিলেক্ট করুন</label>
                                <select
                                    className="w-full p-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                                    value={selectedTenant}
                                    onChange={(e) => setSelectedTenant(e.target.value)}
                                >
                                    <option value="">-- ভাড়াটিয়া বাছুন --</option>
                                    {tenants.map(t => (
                                        <option key={t._id} value={t._id}>
                                            {t.roomNumber} - {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle>রিপোর্ট রেডি</CardTitle>
                        <CardDescription>
                            {reportType === 'overall'
                                ? `${year} সালের ${month} মাসের সবার সামারি রিপোর্ট তৈরি করুন।`
                                : `${year} সালের ${month} মাসের সিলেক্টেড ভাড়াটিয়ার রিপোর্ট তৈরি করুন।`
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full h-16 text-lg"
                            onClick={generateReport}
                            disabled={generating || (reportType === 'tenant' && !selectedTenant)}
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                    PDF তৈরি হচ্ছে...
                                </>
                            ) : (
                                <>
                                    <FileDown className="mr-2 h-6 w-6" />
                                    PDF রিপোর্ট নামান
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
