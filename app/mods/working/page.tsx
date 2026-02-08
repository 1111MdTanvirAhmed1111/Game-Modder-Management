'use client';

import { useModData } from '@/lib/useStorage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { ArrowRight, Clock, ListChecks } from 'lucide-react';

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

export default function WorkingPage() {
  const { projects, isLoading, getCreator } = useModData();

  if (isLoading) {
    return <div className="flex-1 p-8 text-foreground">লোড করা হচ্ছে...</div>;
  }

  const inProgressProjects = projects.filter((p) => p.workStatus === 'চলমান');

  return (
    <main className="flex-1 p-4 md:p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">চলমান কাজ</h1>
              <p className="text-muted-foreground mt-1">
                বর্তমানে কাজ চলছে এমন সব মড প্রজেক্ট
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {inProgressProjects.length} টি প্রজেক্ট চলমান
            </Badge>
          </div>
        </div>

        {/* Cards Grid */}
        {inProgressProjects.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <ListChecks className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">কোনো চলমান প্রজেক্ট নেই</p>
              <p className="text-muted-foreground text-sm mb-6">
                প্রজেক্টের কাজের অবস্থা &quot;চলমান&quot; করলে এখানে দেখা যাবে
              </p>
              <Link href="/mods">
                <Button variant="outline">সব মড দেখুন</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {inProgressProjects.map((project) => {
              const creator = getCreator(project.creatorId);
              const totalPaid = project.paymentRecords.reduce(
                (sum, r) => sum + r.amount,
                0
              );
              const paymentStatus = getPaymentStatus(project.totalPrice, totalPaid);
              const completedTodos = project.todos.filter((t) => t.isDone).length;
              const totalTodos = project.todos.length;
              const progressPercent =
                totalTodos > 0
                  ? Math.round((completedTodos / totalTodos) * 100)
                  : 0;

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

                    {/* Start Date */}
                    {project.startDate && (
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground">শুরুর তারিখ</p>
                        <p className="text-sm font-medium text-foreground">
                          {project.startDate}
                        </p>
                      </div>
                    )}

                    {/* Todo Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">কাজের অগ্রগতি</p>
                        <span className="text-sm font-semibold text-foreground">
                          {completedTodos} / {totalTodos}
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        চলমান
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
