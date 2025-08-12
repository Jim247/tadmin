// Re-export all types and constants for easy importing
export * from './userTypes';
export * from './types';

// Utility type helpers
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

// Common API patterns
export type ID = string;
export type Timestamp = string;

// Status check utilities
export const isNewEnquiry = (status: string) => status === 'new';
export const isAssignedEnquiry = (status: string) => status === 'assigned';
export const isExpiredEnquiry = (status: string) => status === 'expired';
export const isCompletedEnquiry = (status: string) => status === 'completed';

// Role check utilities
export const isAdmin = (role: string) => role === 'admin';
export const isTutor = (role: string) => role === 'tutor';
export const isUser = (role: string) => role === 'user';
