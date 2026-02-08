'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModProject, Creator, Todo, DashboardStats, PaymentRecord, ApprovalNote } from './types';

const PROJECTS_STORAGE_KEY = 'modProjects';
const CREATORS_STORAGE_KEY = 'modCreators';

export function useModData() {
  const [projects, setProjects] = useState<ModProject[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
    const storedCreators = localStorage.getItem(CREATORS_STORAGE_KEY);
    
    if (storedProjects) {
      try {
        setProjects(JSON.parse(storedProjects));
      } catch (e) {
        console.error('[v0] Failed to parse stored projects:', e);
      }
    }
    
    if (storedCreators) {
      try {
        setCreators(JSON.parse(storedCreators));
      } catch (e) {
        console.error('[v0] Failed to parse stored creators:', e);
      }
    }
    
    setIsLoading(false);
  }, []);

  // Save projects
  const saveProjects = useCallback((newProjects: ModProject[]) => {
    setProjects(newProjects);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(newProjects));
  }, []);

  // Save creators
  const saveCreators = useCallback((newCreators: Creator[]) => {
    setCreators(newCreators);
    localStorage.setItem(CREATORS_STORAGE_KEY, JSON.stringify(newCreators));
  }, []);

  // Creator operations
  const addCreator = useCallback(
    (name: string, email?: string, phone?: string, address?: string) => {
      const newCreator: Creator = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        address,
        createdDate: new Date().toISOString().split('T')[0],
      };
      saveCreators([...creators, newCreator]);
      return newCreator;
    },
    [creators, saveCreators]
  );

  const updateCreator = useCallback(
    (id: string, updates: Partial<Creator>) => {
      const updated = creators.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveCreators(updated);
    },
    [creators, saveCreators]
  );

  const deleteCreator = useCallback(
    (id: string) => {
      const hasProjects = projects.some((p) => p.creatorId === id);
      if (hasProjects) {
        alert('এই ক্রিয়েটরের মড আছে, তাই ডিলিট করা যাবে না।');
        return false;
      }
      saveCreators(creators.filter((c) => c.id !== id));
      return true;
    },
    [creators, projects, saveCreators]
  );

  // Project operations
  const addProject = useCallback(
    (project: Omit<ModProject, 'id'>) => {
      const newProject: ModProject = {
        ...project,
        id: Date.now().toString(),
      };
      saveProjects([...projects, newProject]);
      return newProject;
    },
    [projects, saveProjects]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<ModProject>) => {
      const updated = projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
      saveProjects(updated);
    },
    [projects, saveProjects]
  );

  const deleteProject = useCallback(
    (id: string) => {
      saveProjects(projects.filter((p) => p.id !== id));
    },
    [projects, saveProjects]
  );

  // Payment operations
  const addPayment = useCallback(
    (projectId: string, amount: number, description: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      const newPayment: PaymentRecord = {
        id: Date.now().toString(),
        amount,
        date: new Date().toISOString().split('T')[0],
        description,
      };

      const updatedPayments = [...project.paymentRecords, newPayment];
      updateProject(projectId, {
        paymentRecords: updatedPayments,
      });
    },
    [projects, updateProject]
  );

  const updatePayment = useCallback(
    (projectId: string, paymentId: string, updates: Partial<PaymentRecord>) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      const updatedPayments = project.paymentRecords.map((p) =>
        p.id === paymentId ? { ...p, ...updates } : p
      );
      updateProject(projectId, { paymentRecords: updatedPayments });
    },
    [projects, updateProject]
  );

  const deletePayment = useCallback(
    (projectId: string, paymentId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      updateProject(projectId, {
        paymentRecords: project.paymentRecords.filter((p) => p.id !== paymentId),
      });
    },
    [projects, updateProject]
  );

  // Approval operations
  const approveProject = useCallback(
    (projectId: string, note: string) => {
      const approvalNote: ApprovalNote = {
        id: Date.now().toString(),
        note,
        approvedDate: new Date().toISOString().split('T')[0],
      };

      updateProject(projectId, {
        approvalStatus: 'অনুমোদিত',
        approvalNote,
        startDate: new Date().toISOString().split('T')[0],
      });
    },
    [updateProject]
  );

  // Todo operations
  const addTodo = useCallback(
    (projectId: string, title: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      const newTodo: Todo = {
        id: Date.now().toString(),
        title,
        isDone: false,
      };

      updateProject(projectId, {
        todos: [...project.todos, newTodo],
      });
    },
    [projects, updateProject]
  );

  const toggleTodo = useCallback(
    (projectId: string, todoId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      const updatedTodos = project.todos.map((t) =>
        t.id === todoId ? { ...t, isDone: !t.isDone } : t
      );
      updateProject(projectId, { todos: updatedTodos });
    },
    [projects, updateProject]
  );

  const deleteTodo = useCallback(
    (projectId: string, todoId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      updateProject(projectId, {
        todos: project.todos.filter((t) => t.id !== todoId),
      });
    },
    [projects, updateProject]
  );

  // Calculate stats
  const getStats = useCallback((): DashboardStats => {
    const totalPaid = projects.reduce(
      (sum, p) => sum + p.paymentRecords.reduce((s, pr) => s + pr.amount, 0),
      0
    );

    return {
      totalMods: projects.length,
      pendingMods: projects.filter((p) => p.approvalStatus === 'পেন্ডিং').length,
      inProgressMods: projects.filter((p) => p.workStatus === 'চলমান').length,
      completedMods: projects.filter((p) => p.workStatus === 'সম্পূর্ণ').length,
      totalEarned: totalPaid,
      totalDue: projects.reduce((sum, p) => sum + (p.totalPrice - (p.paymentRecords.reduce((s, pr) => s + pr.amount, 0))), 0),
    };
  }, [projects]);

  // Get creator's projects
  const getCreatorProjects = useCallback(
    (creatorId: string) => {
      return projects.filter((p) => p.creatorId === creatorId);
    },
    [projects]
  );

  // Get creator info
  const getCreator = useCallback(
    (creatorId: string) => {
      return creators.find((c) => c.id === creatorId);
    },
    [creators]
  );

  // Get total due for a creator
  const getCreatorTotalDue = useCallback(
    (creatorId: string) => {
      const creatorProjects = projects.filter((p) => p.creatorId === creatorId);
      return creatorProjects.reduce((sum, p) => {
        const totalPaid = p.paymentRecords.reduce((s, pr) => s + pr.amount, 0);
        return sum + (p.totalPrice - totalPaid);
      }, 0);
    },
    [projects]
  );

  return {
    projects,
    creators,
    isLoading,
    // Creator operations
    addCreator,
    updateCreator,
    deleteCreator,
    getCreator,
    getCreatorTotalDue,
    // Project operations
    addProject,
    updateProject,
    deleteProject,
    getCreatorProjects,
    // Payment operations
    addPayment,
    updatePayment,
    deletePayment,
    // Approval operations
    approveProject,
    // Todo operations
    addTodo,
    toggleTodo,
    deleteTodo,
    // Stats
    getStats,
  };
}
