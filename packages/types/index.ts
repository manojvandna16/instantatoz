// =============================================================
// Instantatoz — Shared TypeScript Types
// packages/types/index.ts
// =============================================================

// -------------------------------------------------------
// ENUMS
// -------------------------------------------------------

export enum UserRole {
  USER = 'USER',
  WORKER = 'WORKER',
  ADMIN = 'ADMIN',
}

export enum WorkerStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
}

export enum WorkerAvailability {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  BUSY = 'BUSY',
}

export enum JobStatus {
  CREATED = 'CREATED',
  FINDING_WORKERS = 'FINDING_WORKERS',
  WORKER_ASSIGNED = 'WORKER_ASSIGNED',
  WORKER_ARRIVING = 'WORKER_ARRIVING',
  WORKER_ARRIVED = 'WORKER_ARRIVED',
  OTP_VERIFIED = 'OTP_VERIFIED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

export enum PaymentStatus {
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export enum VerificationDocumentType {
  AADHAAR = 'AADHAAR',
  PAN = 'PAN',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  VOTER_ID = 'VOTER_ID',
  PASSPORT = 'PASSPORT',
  OTHER = 'OTHER',
}

// -------------------------------------------------------
// CORE ENTITIES
// -------------------------------------------------------

export interface User {
  id: string;
  firebaseUid: string;
  phone: string;
  email?: string;
  name: string;
  profilePhoto?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Worker extends User {
  workerProfile: WorkerProfile;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  status: WorkerStatus;
  availability: WorkerAvailability;
  mainCategoryId: string;
  subcategoryIds: string[];
  skills: string[];
  experience?: string;
  hourlyRate?: number;
  bio?: string;
  location?: GeoPoint;
  address: Address;
  averageRating: number;
  totalJobs: number;
  totalEarnings: number;
  pendingPayout: number;
  verificationDocuments: VerificationDocument[];
  bankDetails?: BankDetails;
  deviceToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  requiresVerification: boolean;
  isActive: boolean;
}

export interface Job {
  id: string;
  userId: string;
  mainCategoryId: string;
  subcategoryId: string;
  description: string;
  numberOfWorkers: number;
  expectedHours: number;
  preferredStartTime: Date;
  location: GeoPoint;
  address: string;
  status: JobStatus;
  estimatedAmount?: number;
  finalAmount?: number;
  platformFee?: number;
  workerPayable?: number;
  payment?: Payment;
  assignments: JobAssignment[];
  workSession?: WorkSession;
  cancellationReason?: string;
  cancelledBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobAssignment {
  id: string;
  jobId: string;
  workerId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  acceptedAt?: Date;
  arrivedAt?: Date;
  distance?: number;
  estimatedArrivalMinutes?: number;
}

export interface WorkSession {
  id: string;
  jobId: string;
  startTime: Date; // SERVER TIMESTAMP ONLY
  endTime?: Date;  // SERVER TIMESTAMP ONLY
  durationMinutes?: number;
  billableHours?: number;
  isPaused: boolean;
  pausedAt?: Date;
  otpVerifiedAt: Date;
  otpVerifiedBy: string;
}

export interface Payment {
  id: string;
  jobId: string;
  userId: string;
  amount: number;
  currency: 'INR';
  status: PaymentStatus;
  gateway?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  method?: string;
  failureReason?: string;
  refundId?: string;
  refundAmount?: number;
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerPayout {
  id: string;
  workerId: string;
  jobId: string;
  grossAmount: number;
  platformCommission: number;
  commissionPercent: number;
  workerPayableAmount: number;
  status: PayoutStatus;
  payoutMethod?: string;
  payoutReference?: string;
  paidAt?: Date;
  failureReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment?: string;
  isWorkerReview: boolean; // true = review of worker, false = review of customer
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  jobId?: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: Date;
}

// -------------------------------------------------------
// UTILITY TYPES
// -------------------------------------------------------

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark?: string;
  fullAddress?: string;
  geoPoint?: GeoPoint;
}

export interface VerificationDocument {
  id: string;
  type: VerificationDocumentType;
  documentNumber?: string;
  fileUrl: string;
  isVerified: boolean;
  verifiedAt?: Date;
  rejectionReason?: string;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId?: string;
}

// -------------------------------------------------------
// BILLING TYPES
// -------------------------------------------------------

export interface BillingCalculation {
  hourlyRate: number;
  hours: number;
  numberOfWorkers: number;
  serviceAmount: number;
  platformFee: number;
  taxes: number;
  totalAmount: number;
  workerPayable: number;
  commissionPercent: number;
  breakdown: BillingLineItem[];
}

export interface BillingLineItem {
  label: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
}

// -------------------------------------------------------
// API RESPONSE TYPES
// -------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// -------------------------------------------------------
// JOB MATCHING
// -------------------------------------------------------

export interface NearbyWorker {
  workerId: string;
  name: string;
  profilePhoto?: string;
  rating: number;
  totalJobs: number;
  distance: number; // in KM
  estimatedArrivalMinutes: number;
  hourlyRate?: number;
  skills: string[];
}

export interface JobMatchingConfig {
  radiusKm: number;
  maxWorkersToNotify: number;
  responseTimeoutMinutes: number;
}
