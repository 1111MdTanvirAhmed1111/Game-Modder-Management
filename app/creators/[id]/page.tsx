'use client';

import { useModData } from '@/lib/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function CreatorProfilePage() {
  const params = useParams();
  const creatorId = params.id as string;
  const { creators, getCreatorProjects, isLoading } = useModData();

  if (isLoading) {
    return <div className="flex-1 p-8">লোড করা হচ্ছে...</div>;
  }

  const creator = creators.find((c) => c.id === creatorId);
  const projects = getCreatorProjects(creatorId);

  if (!creator) {
    return (
      <main className="flex-1 p-8">
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">ক্রিয়েটর পাওয়া যায়নি</p>
            <Link href="/creators">
              <Button>ক্রিয়েটরদের তালিকায় ফিরুন</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Calculate statistics
  const completedProjects = projects.filter((p) => p.workStatus === 'সম্পূর্ণ');
  const inProgressProjects = projects.filter((p) => p.workStatus === 'চলমান');
  const pendingApprovalProjects = projects.filter((p) => p.approvalStatus === 'পেন্ডিং');

  const totalEarned = projects.reduce((sum, p) => {
    const paid = p.paymentRecords.reduce((s, pr) => s + pr.amount, 0);
    return sum + paid;
  }, 0);

  const totalDue = projects.reduce((sum, p) => {
    const paid = p.paymentRecords.reduce((s, pr) => s + pr.amount, 0);
    return sum + p.totalPrice - paid;
  }, 0);

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/creators">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ফিরুন
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground">{creator.name}</h1>
            <p className="text-muted-foreground mt-2">ক্রিয়েটর প্রোফাইল এবং প্রজেক্ট ইতিহাস</p>
          </div>
        </div>

        {/* Creator Info Card */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">যোগাযোগ তথ্য</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ক্রিয়েটর আইডি</p>
                <p className="text-foreground font-mono">{creator.id}</p>
              </div>
              {creator.email && (
                <div>
                  <p className="text-sm text-muted-foreground">ইমেইল</p>
                  <p className="text-foreground">{creator.email}</p>
                </div>
              )}
              {creator.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">ফোন</p>
                  <p className="text-foreground">{creator.phone}</p>
                </div>
              )}
              {creator.address && (
                <div>
                  <p className="text-sm text-muted-foreground">ঠিকানা</p>
                  <p className="text-foreground">{creator.address}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                মোট প্রজেক্ট
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{projects.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                সম্পূর্ণ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{completedProjects.length}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                মোট উপার্জন
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">৳{totalEarned}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                মোট বকেয়া
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ৳{totalDue}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="space-y-8">
          {/* Pending Approval */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              অনুমোদনের অপেক্ষায় ({pendingApprovalProjects.length})
            </h2>
            {pendingApprovalProjects.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">কোন প্রজেক্ট নেই</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingApprovalProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>

          {/* In Progress */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              চলমান প্রজেক্ট ({inProgressProjects.length})
            </h2>
            {inProgressProjects.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">কোন প্রজেক্ট নেই</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {inProgressProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>

          {/* Completed */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              সম্পূর্ণ হয়েছে ({completedProjects.length})
            </h2>
            {completedProjects.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">কোন প্রজেক্ট নেই</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {completedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

interface ProjectCardProps {
  project: any;
}

function ProjectCard({ project }: ProjectCardProps) {
  const totalPaid = project.paymentRecords.reduce((sum: number, record: any) => sum + record.amount, 0);
  const amountDue = project.totalPrice - totalPaid;

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{project.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              তৈরি: {project.createdDate}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${
                project.workStatus === 'সম্পূর্ণ'
                  ? 'bg-green-100 text-green-800'
                  : project.workStatus === 'চলমান'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {project.workStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">মোট মূল্য</p>
            <p className="text-lg font-bold text-foreground">৳{project.totalPrice}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">পেয়েছে</p>
            <p className="text-lg font-bold text-blue-600">৳{totalPaid}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">বকেয়া</p>
            <p className={`text-lg font-bold ${amountDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ৳{amountDue}
            </p>
          </div>
          <div className="flex justify-end items-end">
            <Link href={`/mods/${project.id}`}>
              <Button variant="outline" size="sm">দেখুন</Button>
            </Link>
          </div>
        </div>

        {project.paymentRecords.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-2">পেমেন্ট রেকর্ড:</p>
            <div className="space-y-1">
              {project.paymentRecords.map((record: any) => (
                <div key={record.id} className="flex justify-between text-sm text-muted-foreground">
                  <span>{record.date} - {record.description}</span>
                  <span>৳{record.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
