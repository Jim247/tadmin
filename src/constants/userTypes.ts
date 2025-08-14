// User roles and permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  TUTOR: 'tutor', 
  USER: 'user'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Enquiry status options
export const ENQUIRY_STATUS = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  EXPIRED: 'expired',
  COMPLETED: 'completed'
} as const;

export type EnquiryStatus = typeof ENQUIRY_STATUS[keyof typeof ENQUIRY_STATUS];

// Message sender types
export const MESSAGE_SENDER_TYPES = {
  ADMIN: 'admin',
  TUTOR: 'tutor',
  STUDENT: 'student'
} as const;

export type MessageSenderType = typeof MESSAGE_SENDER_TYPES[keyof typeof MESSAGE_SENDER_TYPES];

// Instrument categories and specific instruments
export const INSTRUMENTS = {
  Guitar: ['Electric Guitar', 'Acoustic Guitar', 'Bass Guitar'],
  Keys: ['Piano', 'Keyboard'],
  Singing: ['Singing'],
  Drums: ['Drums'],
} as const;

export type InstrumentCategory = keyof typeof INSTRUMENTS;
export type Instrument = typeof INSTRUMENTS[InstrumentCategory][number];

// Helper to get all instruments as a flat array
export const ALL_INSTRUMENTS: Instrument[] = Object.values(INSTRUMENTS).flat();

// Helper to get all categories
export const INSTRUMENT_CATEGORIES: InstrumentCategory[] = Object.keys(INSTRUMENTS) as InstrumentCategory[];


// Permission checks
export const PERMISSIONS = {
  CAN_ASSIGN_TUTORS: [USER_ROLES.ADMIN],
  CAN_VIEW_ALL_ENQUIRIES: [USER_ROLES.ADMIN],
  CAN_VIEW_ASSIGNED_ENQUIRIES: [USER_ROLES.ADMIN, USER_ROLES.TUTOR],
  CAN_MANAGE_TUTORS: [USER_ROLES.ADMIN],
  CAN_MANAGE_USERS: [USER_ROLES.ADMIN],
  CAN_VIEW_MESSAGES: [USER_ROLES.ADMIN, USER_ROLES.TUTOR],
  CAN_SEND_MESSAGES: [USER_ROLES.ADMIN, USER_ROLES.TUTOR]
} as const;

// Helper function to check permissions
export const hasPermission = (userRole: UserRole, permission: keyof typeof PERMISSIONS): boolean => {
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(userRole);
};
