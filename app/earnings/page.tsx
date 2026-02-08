'use client';

import { useModData } from '@/lib/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Banknote, TrendingUp, AlertCircle, Wallet } from 'lucide-react';

function getPaymentStatusLabel(totalPrice: number, totalPaid: number) {
  if (totalPaid === 0) return 'অপরিশোধিত';
  if (totalPaid >= totalPrice) return 'সম্পূর্ণ শোধিত';
  return 'আংশিক';
}

function getPaymentBadgeClass(status: string) {
  switch (status) {
    case 'সম্পূর্ণ শোধিত':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'আংশিক':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    case 'অপরিশোধিত':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    default:
      return '';
  }
}

export default function EarningsPage() {
  const { projects, creators, isLoading, getCreator, getCreatorProjects } =
    useModData();

  if (isLoading) {
    return <div className="flex-1 p-8 text-foreground">লোড করা হচ্ছে...</div>;
  }

  // Summary stats
  const totalEarned = projects.reduce(
    (sum, p) => sum + p.paymentRecords.reduce((s, pr) => s + pr.amount, 0),
    0
  );
  const totalPrice = projects.reduce((sum, p) => sum + p.totalPrice, 0);
  const totalDue = totalPrice - totalEarned;
  const totalUnpaidMods = projects.filter((p) => {
    const paid = p.paymentRecords.reduce((s, pr) => s + pr.amount, 0);
    return paid === 0 && p.totalPrice > 0;
  }).length;

  // Client-wise earnings data
  const clientData = creators.map((creator) => {
    const creatorProjects = getCreatorProjects(creator.id);
    const earned = creatorProjects.reduce(
      (sum, p) => sum + p.paymentRecords.reduce((s, pr) => s + pr.amount, 0),
      0
    );
    const due = creatorProjects.reduce((sum, p) => {
      const paid = p.paymentRecords.reduce((s, pr) => s + pr.amount, 0);
      return sum + (p.totalPrice - paid);
    }, 0);

    return {
      creatorId: creator.id,
      creatorName: creator.name,
      totalMods: creatorProjects.length,
      totalEarned: earned,
      totalDue: due,
    };
  });

  // Mod-wise earnings data
  const modData = projects.map((project) => {
    const creator = getCreator(project.creatorId);
    const totalPaid = project.paymentRecords.reduce(
      (sum, r) => sum + r.amount,
      0
    );
    const due = project.totalPrice - totalPaid;
    const paymentStatus = getPaymentStatusLabel(project.totalPrice, totalPaid);

    return {
      id: project.id,
      title: project.title,
      creatorName: creator?.name || 'অজানা',
      totalPrice: project.totalPrice,
      paid: totalPaid,
      due,
      paymentStatus,
    };
  });

  // Monthly earning breakdown (group payments by month)
  const monthlyMap = new Map<string, number>();
  for (const project of projects) {
    for (const payment of project.paymentRecords) {
      const dateStr = payment.date;
      // Extract YYYY-MM
      const monthKey = dateStr.substring(0, 7);
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + payment.amount);
    }
  }

  const monthNames: Record<string, string> = {
    '01': 'জানু',
    '02': 'ফেব্রু',
    '03': 'মার্চ',
    '04': 'এপ্রিল',
    '05': 'মে',
    '06': 'জুন',
    '07': 'জুলাই',
    '08': 'আগস্ট',
    '09': 'সেপ্টে',
    '10': 'অক্টো',
    '11': 'নভে',
    '12': 'ডিসে',
  };

  const monthlyData = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, amount]) => {
      const [year, month] = key.split('-');
      const label = `${monthNames[month] || month} ${year}`;
      return { month: label, amount };
    });

  return (
    <main className="flex-1 p-4 md:p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                আয়ের ড্যাশবোর্ড
              </h1>
              <p className="text-muted-foreground mt-1">
                সম্পূর্ণ আয় এবং পেমেন্টের ওভারভিউ
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  মোট উপার্জন
                </p>
              </div>
              <p className="text-3xl font-bold text-green-600">৳{totalEarned}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-md bg-amber-100 flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  মোট বকেয়া
                </p>
              </div>
              <p className="text-3xl font-bold text-amber-600">৳{totalDue}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-md bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  অপরিশোধিত মড
                </p>
              </div>
              <p className="text-3xl font-bold text-red-600">{totalUnpaidMods}</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Chart */}
        {monthlyData.length > 0 && (
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">মাসিক আয়ের বিশ্লেষণ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [`৳${value}`, 'আয়']}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--card))',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Client-wise Earnings */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">ক্লায়েন্ট অনুযায়ী আয়</CardTitle>
          </CardHeader>
          <CardContent>
            {clientData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                কোনো ক্লায়েন্ট ডেটা নেই
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-foreground">ক্লায়েন্ট</TableHead>
                      <TableHead className="text-foreground text-center">
                        মোট মড
                      </TableHead>
                      <TableHead className="text-foreground text-right">
                        মোট পেয়েছে
                      </TableHead>
                      <TableHead className="text-foreground text-right">
                        মোট বকেয়া
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientData.map((client) => (
                      <TableRow key={client.creatorId}>
                        <TableCell className="font-medium text-foreground">
                          {client.creatorName}
                        </TableCell>
                        <TableCell className="text-center text-foreground">
                          {client.totalMods}
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-semibold">
                          ৳{client.totalEarned}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            client.totalDue > 0 ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          ৳{client.totalDue}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mod-wise Earnings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">মড অনুযায়ী আয়</CardTitle>
          </CardHeader>
          <CardContent>
            {modData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                কোনো মড ডেটা নেই
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-foreground">মড</TableHead>
                      <TableHead className="text-foreground">ক্লায়েন্ট</TableHead>
                      <TableHead className="text-foreground text-right">
                        মোট মূল্য
                      </TableHead>
                      <TableHead className="text-foreground text-right">
                        পেয়েছে
                      </TableHead>
                      <TableHead className="text-foreground text-right">
                        বকেয়া
                      </TableHead>
                      <TableHead className="text-foreground text-center">
                        স্ট্যাটাস
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modData.map((mod) => (
                      <TableRow key={mod.id}>
                        <TableCell className="font-medium text-foreground">
                          {mod.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {mod.creatorName}
                        </TableCell>
                        <TableCell className="text-right text-foreground font-medium">
                          ৳{mod.totalPrice}
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-semibold">
                          ৳{mod.paid}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            mod.due > 0 ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          ৳{mod.due}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getPaymentBadgeClass(mod.paymentStatus)}>
                            {mod.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
