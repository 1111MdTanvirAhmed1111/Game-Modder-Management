'use client';

import React from "react"

import { useState } from 'react';
import { useModData } from '@/lib/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Trash2, Edit, Plus } from 'lucide-react';

export default function CreatorsPage() {
  const { creators, isLoading, addCreator, updateCreator, deleteCreator } = useModData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleAddCreator = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      addCreator(formData.name, formData.email, formData.phone, formData.address);
      setFormData({ name: '', email: '', phone: '', address: '' });
      setIsAdding(false);
    }
  };

  const handleUpdateCreator = (e: React.FormEvent, creatorId: string) => {
    e.preventDefault();
    updateCreator(creatorId, {
      name: formData.name || creators.find((c) => c.id === creatorId)?.name,
      email: formData.email || creators.find((c) => c.id === creatorId)?.email,
      phone: formData.phone || creators.find((c) => c.id === creatorId)?.phone,
      address: formData.address || creators.find((c) => c.id === creatorId)?.address,
    });
    setFormData({ name: '', email: '', phone: '', address: '' });
    setEditingId(null);
  };

  const handleEdit = (creator: any) => {
    setFormData({
      name: creator.name,
      email: creator.email || '',
      phone: creator.phone || '',
      address: creator.address || '',
    });
    setEditingId(creator.id);
  };

  const handleDelete = (creatorId: string) => {
    if (window.confirm('এই ক্রিয়েটরকে ডিলিট করতে চান?')) {
      deleteCreator(creatorId);
    }
  };

  if (isLoading) {
    return <div className="flex-1 p-8">লোড করা হচ্ছে...</div>;
  }

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">ক্রিয়েটর ব্যবস্থাপনা</h1>
            <p className="text-muted-foreground mt-2">মড তৈরিকারীদের তথ্য সংরক্ষণ এবং পরিচালনা করুন</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">ড্যাশবোর্ডে ফিরুন</Button>
          </Link>
        </div>

        {/* Add/Edit Form */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">
              {editingId ? 'ক্রিয়েটর সম্পাদনা করুন' : 'নতুন ক্রিয়েটর যোগ করুন'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={
                editingId
                  ? (e) => handleUpdateCreator(e, editingId)
                  : handleAddCreator
              }
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    নাম *
                  </label>
                  <Input
                    type="text"
                    placeholder="ক্রিয়েটরের নাম"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ইমেইল
                  </label>
                  <Input
                    type="email"
                    placeholder="ইমেইল"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ফোন নম্বর
                  </label>
                  <Input
                    type="tel"
                    placeholder="ফোন নম্বর"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ঠিকানা
                  </label>
                  <Input
                    type="text"
                    placeholder="ঠিকানা"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-primary text-primary-foreground">
                  {editingId ? 'আপডেট করুন' : 'যোগ করুন'}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ name: '', email: '', phone: '', address: '' });
                    }}
                  >
                    বাতিল করুন
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Creators List */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            ক্রিয়েটরদের তালিকা ({creators.length})
          </h2>

          {creators.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">কোন ক্রিয়েটর নেই</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {creators.map((creator) => (
                <Card
                  key={creator.id}
                  className="bg-card border-border hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground">
                          {creator.name}
                        </h3>
                        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                          {creator.email && <p>ইমেইল: {creator.email}</p>}
                          {creator.phone && <p>ফোন: {creator.phone}</p>}
                          {creator.address && <p>ঠিকানা: {creator.address}</p>}
                          <p className="text-xs mt-2">
                            যোগ করা হয়েছে: {creator.createdDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/creators/${creator.id}`}>
                          <Button variant="outline" size="sm">
                            প্রজেক্ট দেখুন
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(creator)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(creator.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
