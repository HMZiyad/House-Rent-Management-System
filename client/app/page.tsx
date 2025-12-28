"use client"

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DashboardSummary } from '@/components/DashboardSummary';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Home() {
  const [report, setReport] = useState(null);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, billsRes] = await Promise.all([
          api.get('/reports/property'),
          api.get('/bills?status=Unpaid')
        ]);

        setReport(reportRes.data);
        setUnpaidBills(billsRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">ড্যাশবোর্ড</h2>
        <p className="text-muted-foreground">আপনার প্রপার্টির অবস্থার ওভারভিউ।</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <DashboardSummary report={report} />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>বাকি বিল</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>লোডিং...</p>
            ) : unpaidBills.length === 0 ? (
              <p className="text-sm text-muted-foreground">কোনো বাকি বিল নেই, সব ক্লিয়ার!</p>
            ) : (
              <div className="space-y-4">
                {unpaidBills.map((bill: any, i) => (
                  <motion.div
                    key={bill._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{bill.tenant?.name || 'অজানা ভাড়াটিয়া'}</p>
                      <p className="text-xs text-muted-foreground">{bill.month} {bill.year}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-bold text-rose-500">{formatCurrency(bill.dueAmount)}</div>
                      <div className="text-xs text-muted-foreground">বাকি</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>রিসেন্ট অ্যাক্টিভিটি</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">নতুন কোনো অ্যাক্টিভিটি নেই।</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
