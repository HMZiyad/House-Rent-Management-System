"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface DashboardSummaryProps {
    report: {
        totalRevenue: number;
        totalCollected: number;
        totalOutstanding: number;
        totalUtilityExpenses: number;
        netIncome: number;
    } | null;
}

export function DashboardSummary({ report }: DashboardSummaryProps) {
    if (!report) return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
    );

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">মোট আদায়</CardTitle>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-emerald-500"
                    >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(report.totalCollected)}</div>
                    <p className="text-xs text-muted-foreground">
                        প্রত্যাশিত আয়ের +{(report.totalCollected / (report.totalRevenue || 1) * 100).toFixed(0)}%
                    </p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">বাকি টাকা</CardTitle>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-rose-500"
                    >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-rose-500 font-mono">{formatCurrency(report.totalOutstanding)}</div>
                    <p className="text-xs text-muted-foreground">
                        বর্তমানে বকেয়া বিল
                    </p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">ইউটিলিটি খরচ</CardTitle>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-amber-500"
                    >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-500">{formatCurrency(report.totalUtilityExpenses)}</div>
                    <p className="text-xs text-muted-foreground">
                        মোট ইউটিলিটি খরচ
                    </p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">সম্ভাব্য আয়</CardTitle>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-blue-500"
                    >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(report.totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                        সব বিল পরিশোধ হলে
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
