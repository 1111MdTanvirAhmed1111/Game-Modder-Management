'use client';

import { useModData } from '@/lib/useStorage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, Inbox, ListChecks } from 'lucide-react';

function getPaymentStatus(totalPrice: number, totalPaid: number) {
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

export default function PendingPage() {
  const { projects, isLoading, getCreator } = useModData();

  if (isLoading) {
    return <div className="flex-1 p-8 text-foreground">লোড করা হচ্ছে...</div>;
  }

  const pendingProjects = projects.filter((p) => p.workStatus === 'পেন্ডিং');

  return (
    <main className="flex-1 p-4 md:p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">পেন্ডিং কাজ</h1>
              <p className="text-muted-foreground mt-1">
                যেসব মড প্রজেক্টের কাজ এখনো শুরু হয়নি
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {pendingProjects.length} টি প্রজেক্ট পেন্ডিং
            </Badge>
          </div>
        </div>

        {/* Cards Grid */}
        {pendingProjects.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <ListChecks className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">কোনো পেন্ডিং প্রজেক্ট নেই</p>
              <p className="text-muted-foreground text-sm mb-6">
                সব প্রজেক্টের কাজ শুরু হয়ে গেছে বা সম্পন্ন হয়েছে
              </p>
              <Link href="/mods">
                <Button variant="outline">সব মড দেখুন</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingProjects.map((project) => {
              const creator = getCreator(project.creatorId);
              const totalPaid = project.paymentRecords.reduce(
                (sum, r) => sum + r.amount,
                0,
              );
              const paymentStatus = getPaymentStatus(project.totalPrice, totalPaid);
              const totalTodos = project.todos.length;

              return (
                <Card
                  key={project.id}
                  className="bg-card border-border hover:shadow-lg transition-shadow flex flex-col"
                >
                  <CardContent className="pt-6 flex flex-col flex-1">
                    {/* Title and Creator */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-foreground leading-tight">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {creator?.name || 'অজানা ক্রিয়েটর'}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground">মোট মূল্য</p>
                      <p className="text-sm font-semibold text-foreground">
                        ৳{project.totalPrice.toLocaleString('bn-BD')}
                      </p>
                    </div>

                    {/* Created Date */}
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground">তৈরির তারিখ</p>
                      <p className="text-sm font-medium text-foreground">
                        {project.createdDate}
                      </p>
                    </div>

                    {/* Todo count */}
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground">কাজের তালিকা</p>
                      <p className="text-sm font-medium text-foreground">
                        {totalTodos > 0 ? `${totalTodos} টি কাজ যোগ করা হয়েছে` : 'কোনো কাজ যোগ হয়নি'}
                      </p>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        পেন্ডিং
                      </Badge>
                      <Badge className={getPaymentBadgeClass(paymentStatus)}>
                        {paymentStatus}
                      </Badge>
                    </div>

                    {/* Quick Action */}
                    <div className="mt-auto pt-4 border-t border-border">
                      <Link href={`/mods/${project.id}`}>
                        <Button
                          variant="outline"
                          className="w-full flex items-center justify-center gap-2 bg-transparent"
                        >
                          বিস্তারিত দেখুন
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
