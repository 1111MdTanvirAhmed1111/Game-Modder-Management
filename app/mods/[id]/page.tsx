'use client';

import React from "react"

import { useParams, useRouter } from 'next/navigation';
import { useModData } from '@/lib/useStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Trash2, ArrowLeft, Plus, CheckCircle2, Edit2 } from 'lucide-react';
import Link from 'next/link';

export default function ModDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    projects,
    getCreator,
    updateProject,
    addPayment,
    updatePayment,
    deletePayment,
    addTodo,
    toggleTodo,
    deleteTodo,
    approveProject,
    isLoading,
  } = useModData();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const project = projects.find((p) => p.id === id);
  const creator = project ? getCreator(project.creatorId) : null;

  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDesc, setPaymentDesc] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [showApprovalForm, setShowApprovalForm] = useState(false);

  if (isLoading) return <div className="flex-1 p-8">লোড করা হচ্ছে...</div>;
  if (!project || !creator) return <div className="flex-1 p-8 text-foreground">প্রজেক্ট পাওয়া যায়নি</div>;

  const totalPaid = project.paymentRecords.reduce((sum, r) => sum + r.amount, 0);
  const amountDue = project.totalPrice - totalPaid;
  const completedTodos = project.todos.filter((t) => t.isDone).length;
  const progressPercentage = project.todos.length > 0 ? Math.round((completedTodos / project.todos.length) * 100) : 0;

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      addTodo(project.id, newTodoTitle);
      setNewTodoTitle('');
    }
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount && paymentDesc.trim()) {
      const amount = parseInt(paymentAmount);
      if (amount > 0 && amount <= project.totalPrice) {
        addPayment(project.id, amount, paymentDesc);
        setPaymentAmount('');
        setPaymentDesc('');
      } else {
        alert('অবৈধ পরিমাণ');
      }
    }
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (approvalNote.trim()) {
      approveProject(project.id, approvalNote);
      setApprovalNote('');
      setShowApprovalForm(false);
    }
  };

  const handleWorkStatusChange = (status: string) => {
    updateProject(project.id, {
      workStatus: status as any,
      completedDate: status === 'সম্পূর্ণ' ? new Date().toISOString().split('T')[0] : undefined,
    });
  };

  return (
    <main className="flex-1 p-4 md:p-8 overflow-auto bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/mods">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ফিরুন
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{project.title}</h1>
            <p className="text-muted-foreground mt-1">ক্রিয়েটর: {creator.name}</p>
          </div>
        </div>

        {/* Top Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-blue-600 mb-2">মোট মূল্য</p>
              <p className="text-2xl font-bold text-blue-700">৳{project.totalPrice}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-green-600 mb-2">পেয়েছে</p>
              <p className="text-2xl font-bold text-green-700">৳{totalPaid}</p>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${amountDue === 0 ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-red-50 to-red-100 border-red-200'}`}>
            <CardContent className="pt-6">
              <p className={`text-xs font-medium mb-2 ${amountDue === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                বকেয়া
              </p>
              <p className={`text-2xl font-bold ${amountDue === 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                ৳{amountDue}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-purple-600 mb-2">প্রগতি</p>
              <p className="text-2xl font-bold text-purple-700">{progressPercentage}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Approval Section */}
            {project.approvalStatus === 'পেন্ডিং' && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader className="bg-yellow-100">
                  <CardTitle className="text-yellow-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    অনুমোদন অপেক্ষায়
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {!showApprovalForm ? (
                    <Button onClick={() => setShowApprovalForm(true)} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                      অনুমোদন করুন
                    </Button>
                  ) : (
                    <form onSubmit={handleApprove} className="space-y-4">
                      <textarea
                        placeholder="অনুমোদন নোট লিখুন..."
                        value={approvalNote}
                        onChange={(e) => setApprovalNote(e.target.value)}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg bg-white text-foreground text-sm"
                        rows={3}
                        required
                      />
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white flex-1">
                          নিশ্চিত করুন
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowApprovalForm(false)} className="flex-1">
                          বাতিল করুন
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            {project.approvalStatus === 'অনুমোদিত' && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-800">অনুমোদিত হয়েছে</p>
                      <p className="text-sm text-green-700 mt-1">{project.approvalNote?.note}</p>
                      <p className="text-xs text-green-600 mt-2">তারিখ: {project.approvalNote?.approvedDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Status */}
            <Card className="bg-card border-border">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500">
                <CardTitle className="text-white">প্রজেক্ট অবস্থা</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">কাজের অবস্থা:</label>
                  <div className="flex flex-wrap gap-2">
                    {['পেন্ডিং', 'চলমান', 'সম্পূর্ণ'].map((status) => (
                      <Button
                        key={status}
                        onClick={() => handleWorkStatusChange(status)}
                        variant={project.workStatus === status ? 'default' : 'outline'}
                        size="sm"
                        className={project.workStatus === status ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : ''}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>

                {project.todos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      কাজের অগ্রগতি: {completedTodos} / {project.todos.length}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Todos */}
            <Card className="bg-card border-border">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500">
                <CardTitle className="text-white">করণীয় তালিকা</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <form onSubmit={handleAddTodo} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="নতুন কাজ যোগ করুন..."
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    className="border-border bg-background text-foreground flex-1"
                  />
                  <Button type="submit" size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </form>

                {project.todos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">কোনো কাজ নেই</p>
                ) : (
                  <div className="space-y-2">
                    {project.todos.map((todo) => (
                      <div key={todo.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition">
                        <input
                          type="checkbox"
                          checked={todo.isDone}
                          onChange={() => toggleTodo(project.id, todo.id)}
                          className="w-5 h-5 rounded border-border cursor-pointer accent-orange-500"
                        />
                        <span className={`flex-1 ${todo.isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {todo.title}
                        </span>
                        <button
                          onClick={() => deleteTodo(project.id, todo.id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Info */}
          <div className="space-y-6">
            {/* Payment Summary Card */}
            <Card className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 border-0 text-white">
              <CardHeader>
                <CardTitle className="text-white">পেমেন্ট সারসংক্ষেপ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-white/90">মোট:</span>
                  <span className="text-2xl font-bold">৳{project.totalPrice}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-white/90">পেয়েছি:</span>
                  <span className="text-2xl font-bold">৳{totalPaid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/90">বকেয়া:</span>
                  <span className="text-2xl font-bold">৳{amountDue}</span>
                </div>
              </CardContent>
            </Card>

            {/* Add Payment Form */}
            <Card className="bg-card border-border">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500">
                <CardTitle className="text-white">পেমেন্ট যোগ করুন</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleAddPayment} className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">পরিমাণ (৳):</label>
                    <Input
                      type="number"
                      placeholder="পরিমাণ"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="border-border bg-background text-foreground"
                      min="1"
                      max={project.totalPrice}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">বর্ণনা:</label>
                    <Input
                      type="text"
                      placeholder="যেমন: প্রথম কিস্তি"
                      value={paymentDesc}
                      onChange={(e) => setPaymentDesc(e.target.value)}
                      className="border-border bg-background text-foreground"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600">
                    পেমেন্ট যোগ করুন
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Payment Records */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">পেমেন্ট রেকর্ড</CardTitle>
              </CardHeader>
              <CardContent>
                {project.paymentRecords.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">কোনো পেমেন্ট নেই</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {project.paymentRecords.map((payment) => (
                      <div key={payment.id} className="p-3 bg-muted rounded-lg border border-border hover:border-primary transition">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-foreground">৳{payment.amount}</p>
                            <p className="text-sm text-muted-foreground">{payment.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{payment.date}</p>
                          </div>
                          <button
                            onClick={() => deletePayment(project.id, payment.id)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">প্রজেক্ট তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">তৈরি:</p>
                  <p className="text-foreground font-medium">{project.createdDate}</p>
                </div>
                {project.startDate && (
                  <div>
                    <p className="text-muted-foreground">শুরু:</p>
                    <p className="text-foreground font-medium">{project.startDate}</p>
                  </div>
                )}
                {project.completedDate && (
                  <div>
                    <p className="text-muted-foreground">সম্পন্ন:</p>
                    <p className="text-foreground font-medium">{project.completedDate}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
