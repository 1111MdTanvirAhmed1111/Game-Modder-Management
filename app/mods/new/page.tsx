'use client';

import React from "react"

import { useRouter } from 'next/navigation';
import { useModData } from '@/lib/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const { creators, addProject } = useModData();
  const [formData, setFormData] = useState({
    title: '',
    creatorId: '',
    totalPrice: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.creatorId || !formData.totalPrice) {
      alert('সব প্রয়োজনীয় ফিল্ড পূরণ করুন');
      return;
    }

    const newProject = addProject({
      title: formData.title,
      creatorId: formData.creatorId,
      totalPrice: parseInt(formData.totalPrice),
      paymentRecords: [],
      workStatus: 'পেন্ডিং',
      approvalStatus: 'পেন্ডিং',
      createdDate: new Date().toISOString().split('T')[0],
      todos: [],
    });

    if (newProject) {
      router.push(`/mods/${newProject.id}`);
    }
  };

  return (
    <main className="flex-1 p-8 overflow-auto">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/mods">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ফিরুন
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">নতুন প্রজেক্ট তৈরি করুন</h1>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">প্রজেক্ট তথ্য</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Creator Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  ক্রিয়েটর নির্বাচন করুন *
                </label>
                {creators.length === 0 ? (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground text-sm mb-3">
                      কোন ক্রিয়েটর নেই। প্রথমে একজন ক্রিয়েটর তৈরি করুন।
                    </p>
                    <Link href="/creators">
                      <Button size="sm">ক্রিয়েটর যোগ করুন</Button>
                    </Link>
                  </div>
                ) : (
                  <select
                    name="creatorId"
                    value={formData.creatorId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="">-- ক্রিয়েটর নির্বাচন করুন --</option>
                    {creators.map((creator) => (
                      <option key={creator.id} value={creator.id}>
                        {creator.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Project Title */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  প্রজেক্টের নাম *
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="যেমন: ETS2 ট্রাক স্কিন মড"
                  required
                  className="border-border bg-background text-foreground"
                />
              </div>

              {/* Total Price */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  মোট মূল্য (৳) *
                </label>
                <Input
                  type="number"
                  name="totalPrice"
                  value={formData.totalPrice}
                  onChange={handleChange}
                  placeholder="যেমন: 5000"
                  step="1"
                  min="0"
                  required
                  className="border-border bg-background text-foreground"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t border-border">
                <Link href="/mods" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    বাতিল করুন
                  </Button>
                </Link>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground">
                  প্রজেক্ট তৈরি করুন
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
