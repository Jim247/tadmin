import { UserRole, EnquiryStatus, MessageSenderType, Instrument, SkillLevel } from './userTypes';

// Database table interfaces based on your Supabase schema

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Tutor {
  id: string;
  user_id: string;
  instruments: Instrument[];
  skill_level: SkillLevel;
  bio?: string;
  hourly_rate?: number;
  available: boolean;
  location?: string;
  travel_distance?: number;
  created_at: string;
  updated_at: string;
  
  // Joined fields when fetching with user data
  user?: User;
}

export interface BookingOwner {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  instrument: string;
  skill_level: string;
  message: string;
  location?: string;
  preferred_times?: string;
  budget?: number;
  status: EnquiryStatus;
  assigned_tutor_id?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  assigned_tutor?: Tutor;
  student?: Student;
}

export interface Student {
  id: string;
  booking_owner_id: string;
  first_name: string;
  last_name: string;
  age?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  booking_owner?: BookingOwner;
}

export interface Message {
  id: string;
  enquiry_id: string;
  sender_type: MessageSenderType;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  
  // Joined fields
  enquiry?: BookingOwner;
  sender?: User | Student;
}

// API Response types for Refine data provider
export interface ApiResponse<T> {
  data: T;
  total?: number;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
}

// Form types for creating/updating records
export interface CreateUserForm {
  email: string;
  password: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
}

export interface UpdateUserForm {
  email?: string;
  role?: UserRole;
  first_name?: string;
  last_name?: string;
}

export interface CreateTutorForm {
  user_id: string;
  instruments: Instrument[];
  skill_level: SkillLevel;
  bio?: string;
  hourly_rate?: number;
  location?: string;
  travel_distance?: number;
}

export interface UpdateTutorForm {
  instruments?: Instrument[];
  skill_level?: SkillLevel;
  bio?: string;
  hourly_rate?: number;
  available?: boolean;
  location?: string;
  travel_distance?: number;
}

export interface UpdateEnquiryForm {
  status?: EnquiryStatus;
  assigned_tutor_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  instrument?: string;
  skill_level?: string;
  message?: string;
  location?: string;
  preferred_times?: string;
  budget?: number;
}

export interface CreateMessageForm {
  enquiry_id: string;
  sender_type: MessageSenderType;
  sender_id: string;
  content: string;
}

// Filter types for API queries
export interface EnquiryFilters {
  status?: EnquiryStatus;
  instrument?: Instrument;
  skill_level?: SkillLevel;
  assigned_tutor_id?: string;
  created_after?: string;
  created_before?: string;
}

export interface TutorFilters {
  instruments?: Instrument[];
  skill_level?: SkillLevel;
  available?: boolean;
  location?: string;
  min_rate?: number;
  max_rate?: number;
}

// Dashboard statistics types
export interface DashboardStats {
  total_enquiries: number;
  new_enquiries: number;
  assigned_enquiries: number;
  total_tutors: number;
  active_tutors: number;
  unread_messages: number;
}

// Authentication context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Notification types
export interface NotificationData {
  type: 'new_enquiry' | 'tutor_assigned' | 'new_message' | 'enquiry_expired';
  title: string;
  message: string;
  enquiry_id?: string;
  created_at: string;
}
