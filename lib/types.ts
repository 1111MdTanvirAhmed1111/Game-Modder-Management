export type WorkStatus = 'পেন্ডিং' | 'চলমান' | 'সম্পূর্ণ';
export type PaymentStatus = 'অপরিশোধিত' | 'আংশিক' | 'সম্পূর্ণ শোধিত';
export type ApprovalStatus = 'পেন্ডিং' | 'অনুমোদিত';

export interface Todo {
  id: string;
  title: string;
  isDone: boolean;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  description: string;
}

export interface ApprovalNote {
  id: string;
  note: string;
  approvedDate: string;
}

export interface Creator {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdDate: string;
}

export interface ModProject {
  id: string;
  title: string;
  creatorId: string;
  totalPrice: number;
  paymentRecords: PaymentRecord[];
  workStatus: WorkStatus;
  approvalStatus: ApprovalStatus;
  approvalNote?: ApprovalNote;
  createdDate: string;
  completedDate?: string;
  startDate?: string;
  todos: Todo[];
}

export interface DashboardStats {
  totalMods: number;
  pendingMods: number;
  inProgressMods: number;
  completedMods: number;
  totalEarned: number;
  totalDue: number;
}
