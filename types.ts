
export interface User {
  email: string;
  avatarUrl: string;
}

export interface StatCardData {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
}

export interface StreamingReportItem {
  id: number;
  title: string;
  timeStreamed: string;
  revenue: number;
  trend: number[];
  published: string;
  parts?: StreamingReportItem[];
}

export interface PaymentHistoryItem {
  date: string;
  amount: number;
  method: string;
  status: 'Paid' | 'Pending' | 'Failed';
  notes: string;
}
