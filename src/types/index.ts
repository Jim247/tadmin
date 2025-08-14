// Types for the tutor management system

export interface Tutor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  instruments: string[];
  location?: string;
  strikes: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  instrument?: string;
  level?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Enquiry {
  email: string;
  last_name: string;
  first_name: string;
  id: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  instrument: string;
  students: string[];
  level?: string;
  location?: string;
  message?: string;
  status: 'new' | 'assigned' | 'expired' | 'completed';
  tutor_id?: string;
  assigned_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  enquiry_id: string;
  sender_type: 'admin' | 'tutor' | 'student';
  sender_email?: string;
  subject?: string;
  body: string;
  created_at: string;
}
