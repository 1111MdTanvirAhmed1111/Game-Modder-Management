'use client';

import { useModData } from '@/lib/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CreatorSummary {
  creatorId: string;
  creatorName: string;
  totalMods: number;
  completedMods: number;
  totalDue: number;
  totalEarned: number;
}

export default function DashboardPage() {
  const { projects, creators, isLoading, getStats, getCreatorProjects } = useModData();

  if (isLoading) return <div className="p-8">লোড করা হচ্ছে...</div>;

  const stats = getStats();

  // Create creator summaries
  const creatorSummaries: CreatorSummary[] = creators.map((creator) => {
    const creatorProjects = getCreatorProjects(creator.id);
    const completedMods = creatorProjects.filter((p) => p.workStatus === 'সম্পূর্ণ').length;
    const totalEarned = creatorProjects.reduce((sum, p) => {
      const paid = p.paymentRecords.reduce((s, pr) => s + pr.amount, 0);
      return sum + paid;
    }, 0);
    const totalDue = creatorProjects.reduce((sum, p) => {
      const paid = p.paymentRecords.reduce((s, pr) => s + pr.amount, 0);
      return sum + p.totalPrice - paid;
    }, 0);

    return {
      creatorId: creator.id,
      creatorName: creator.name,
      totalMods: creatorProjects.length,
      completedMods,
      totalDue,
      totalEarned,
    };
  });

  return (
    <main className="flex-1">
      <div className="p-8 space-y-8 overflow-y-scroll">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">ড্যাশবোর্ড</h1>
            <p className="text-muted-foreground mt-2">আপনার মড প্রজেক্ট এবং পেমেন্টের সম্পূর্ণ ওভারভিউ</p>
          </div>
          <div className="flex gap-2">
            <Link href="/creators">
              <Button variant="outline">ক্রিয়েটর ব্যবস্থাপনা</Button>
            </Link>
            <Link href="/mods">
              <Button>সব মড দেখুন</Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">মোট মড</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalMods}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">মোট উপার্জন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">৳{stats.totalEarned}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">মোট বকেয়া</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">৳{stats.totalDue}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">সম্পূর্ণ হয়েছে</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.completedMods}</div>
            </CardContent>
          </Card>
        </div>

        {/* Creator Sections */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">ক্রিয়েটরদের বিস্তারিত</h2>

          {creatorSummaries.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">কোন ক্রিয়েটর নেই। প্রথম ক্রিয়েটর তৈরি করুন!</p>
                <Link href="/creators">
                  <Button>নতুন ক্রিয়েটর যোগ করুন</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {creatorSummaries.map((creator) => (
                <Card key={creator.creatorId} className="bg-card border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-foreground">{creator.creatorName}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">আইডি: {creator.creatorId}</p>
                      </div>
                      <Link href={`/creators/${creator.creatorId}`}>
                        <Button variant="outline" size="sm">দেখুন</Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">মোট প্রজেক্ট</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{creator.totalMods}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">সম্পূর্ণ</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{creator.completedMods}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">পেয়েছে</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">৳{creator.totalEarned}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">বকেয়া</p>
                        <p className={`text-2xl font-bold mt-1 ${creator.totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ৳{creator.totalDue}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
