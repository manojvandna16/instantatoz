// types/index.ts — All shared TypeScript types for Admin Panel

// ─── Admin Roles ─────────────────────────────────────────────────────────────
export type AdminRole =
  | 'SUPER_ADMIN'
  | 'OPERATIONS_ADMIN'
  | 'WORKER_MANAGER'
  | 'JOB_MANAGER'
  | 'FINANCE_ADMIN'
  | 'SUPPORT_ADMIN'
  | 'CONTENT_ADMIN'
  | 'ANALYTICS_VIEWER';

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
  lastLogin?: string;
  active: boolean;
}

// ─── Location Hierarchy (Expansion-Ready) ────────────────────────────────────
export interface LocationHierarchy {
  country: string;       // India
  state: string;         // Uttarakhand
  district: string;      // Uttarkashi
  tehsil?: string;       // Bhatwari
  block?: string;        // Block name
  city?: string;         // City/Town
  village?: string;      // Village/Locality
  pinCode?: string;      // 249193
  lat?: number;
  lng?: number;
}

export interface ServiceArea {
  id: string;
  name: string;
  location: LocationHierarchy;
  matchingRadiusKm: number;
  active: boolean;
  categories: string[];
  createdAt: string;
}

// ─── Worker ──────────────────────────────────────────────────────────────────
export type WorkerStatus =
  | 'ONLINE'
  | 'OFFLINE'
  | 'BUSY'
  | 'AVAILABLE'
  | 'ON_JOB'
  | 'SUSPENDED'
  | 'BLOCKED'
  | 'UNKNOWN';

export type WorkerVerificationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_MORE_INFO'
  | 'SUSPENDED';

export interface Worker {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  category: string;
  subcategory?: string;
  experience?: string;
  skills?: string[];
  registeredLocation: LocationHierarchy;
  currentLocation?: { lat: number; lng: number; updatedAt: string };
  verificationStatus: WorkerVerificationStatus;
  status: WorkerStatus;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  lastActive?: string;
  joinedAt: string;
  documents?: WorkerDocument[];
  bankDetails?: { verified: boolean };
}

export interface WorkerDocument {
  id: string;
  type: string;
  url: string;
  uploadedAt: string;
  verified: boolean;
}

// ─── Job ─────────────────────────────────────────────────────────────────────
export type JobStatus =
  | 'PENDING'
  | 'SEARCHING'
  | 'ACCEPTED'
  | 'WORKER_ARRIVING'
  | 'WORKER_ARRIVED'
  | 'OTP_VERIFIED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'REFUNDED';

export interface Job {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  category: string;
  subcategory?: string;
  location: LocationHierarchy & { address: string };
  requestedWorkers: number;
  assignedWorkers: string[];
  expectedHours: number;
  hourlyRate: number;
  estimatedAmount: number;
  finalAmount?: number;
  status: JobStatus;
  createdAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  paymentStatus?: PaymentStatus;
  commission?: number;
  workerPayable?: number;
  disputeId?: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────
export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'DISPUTED';

export interface Payment {
  id: string;
  jobId: string;
  userId: string;
  grossAmount: number;
  gatewayName: string;
  gatewayTransactionId: string;
  status: PaymentStatus;
  gatewayFee?: number;
  platformCommission: number;
  workerPayable: number;
  refundAmount?: number;
  netPlatformRevenue: number;
  createdAt: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number;
  totalWorkers: number;
  verifiedWorkers: number;
  pendingVerification: number;
  onlineWorkers: number;
  offlineWorkers: number;
  busyWorkers: number;
  suspendedWorkers: number;
  activeJobs: number;
  searchingJobs: number;
  inProgressJobs: number;
  completedJobsToday: number;
  cancelledJobsToday: number;
  todayPayments: number;
  todayCommission: number;
  pendingPayouts: number;
  openComplaints: number;
  openDisputes: number;
  averageRating: number;
}

// ─── Complaint ───────────────────────────────────────────────────────────────
export type ComplaintStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'UNDER_REVIEW'
  | 'AWAITING_USER'
  | 'AWAITING_WORKER'
  | 'RESOLVED'
  | 'REJECTED'
  | 'ESCALATED';

export interface Complaint {
  id: string;
  type: string;
  userId?: string;
  workerId?: string;
  jobId?: string;
  description: string;
  status: ComplaintStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolution?: string;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  adminId: string;
  adminRole: AdminRole;
  action: string;
  targetId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  timestamp: string;
  ipAddress?: string;
}
