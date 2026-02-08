'use client';

import { useModData } from '@/lib/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useState } from 'react';
import { Trash2, Edit, Filter, ChevronUp, ChevronDown } from 'lucide-react';

type SortBy = 'name' | 'creator' | 'date';
type SortOrder = 'asc' | 'desc';
type ApprovalFilter = 'সব' | 'পেন্ডিং' | 'অনুমোদিত';

export default function ModsPage() {
  const { projects, creators, isLoading, deleteProject, getCreator } = useModData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>('সব');

  if (isLoading) return <div className="p-8 flex-1">লোড করা হচ্ছে...</div>;

  // Search and approval status filter
  const filteredProjects = projects.filter((project) => {
    const creator = getCreator(project.creatorId);
    const searchLower = searchTerm.toLowerCase();
    
    // Search filter
    const matchesSearch = (
      project.title.toLowerCase().includes(searchLower) ||
      creator?.name.toLowerCase().includes(searchLower)
    );
    
    // Approval status filter
    const matchesApproval = 
      approvalFilter === 'সব' ||
      (approvalFilter === 'পেন্ডিং' && project.approvalStatus === 'পেন্ডিং') ||
      (approvalFilter === 'অনুমোদিত' && project.approvalStatus === 'অনুমোদিত');
    
    return matchesSearch && matchesApproval;
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'name') {
      comparison = a.title.localeCompare(b.title, 'bn-BD');
    } else if (sortBy === 'creator') {
      const creatorA = getCreator(a.creatorId)?.name || '';
      const creatorB = getCreator(b.creatorId)?.name || '';
      comparison = creatorA.localeCompare(creatorB, 'bn-BD');
    } else {
      // Sort by date
      comparison = new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleDelete = (projectId: string, title: string) => {
    if (window.confirm(`"${title}" ডিলিট করতে চান?`)) {
      deleteProject(projectId);
    }
  };

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">মড প্রজেক্ট</h1>
            <p className="text-muted-foreground mt-2">সব মড প্রজেক্ট পরিচালনা করুন</p>
          </div>
          <Link href="/mods/new">
            <Button className="bg-primary text-primary-foreground">নতুন প্রজেক্ট</Button>
          </Link>
        </div>

        {/* Search and Sort */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Filter className="w-5 h-5" />
              অনুসন্ধান এবং সর্ট
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <Input
              type="text"
              placeholder="প্রজেক্ট বা ক্রিয়েটরের নাম খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-border bg-background text-foreground"
            />

            {/* Approval Status Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                অনুমোদন স্ট্যাটাস:
              </label>
              <div className="flex gap-2 flex-wrap">
                {(['সব', 'পেন্ডিং', 'অনুমোদিত'] as ApprovalFilter[]).map((filter) => (
                  <Button
                    key={filter}
                    onClick={() => setApprovalFilter(filter)}
                    variant={approvalFilter === filter ? 'default' : 'outline'}
                    size="sm"
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort Buttons */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">
                সর্ট করুন:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'name' as SortBy, label: 'নাম' },
                  { value: 'creator' as SortBy, label: 'ক্রিয়েটর' },
                  { value: 'date' as SortBy, label: 'তারিখ' },
                ].map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    variant={sortBy === option.value ? 'default' : 'outline'}
                    size="sm"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              
              {/* Sort Order Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <label className="text-sm font-medium text-foreground">ক্রম:</label>
                <Button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {sortOrder === 'asc' ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      আরোহণ
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      অবরোহণ
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        {sortedProjects.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {projects.length === 0 ? 'কোন প্রজেক্ট নেই। নতুন প্রজেক্ট তৈরি করুন!' : 'কোন ফলাফল নেই।'}
              </p>
              {projects.length === 0 && (
                <Link href="/mods/new">
                  <Button>প্রথম প্রজেক্ট তৈরি করুন</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedProjects.map((project) => {
              const creator = getCreator(project.creatorId);
              const totalPaid = project.paymentRecords.reduce((sum, r) => sum + r.amount, 0);
              const amountDue = project.totalPrice - totalPaid;

              return (
                <Card
                  key={project.id}
                  className="bg-card border-border hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          ক্রিয়েটর: {creator?.name || 'অজানা'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          তৈরি: {project.createdDate}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            project.approvalStatus === 'অনুমোদিত'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {project.approvalStatus}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">মোট মূল্য</p>
                        <p className="text-lg font-bold text-foreground mt-1">৳{project.totalPrice}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">পেয়েছে</p>
                        <p className="text-lg font-bold text-blue-600 mt-1">৳{totalPaid}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">বকেয়া</p>
                        <p className={`text-lg font-bold mt-1 ${amountDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ৳{amountDue}
                        </p>
                      </div>
                      <div className="flex gap-2 justify-end items-end">
                        <Link href={`/mods/${project.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(project.id, project.title)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
