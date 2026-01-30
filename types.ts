
export enum UserRole {
  ADMIN = 'ADMIN',
  RESEARCHER = 'RESEARCHER'
}

export enum CourseStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
  FULLY_COMPLETED = 'FULLY_COMPLETED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  joinedDate: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  link: string;
  type: 'Online' | 'Offline';
  category: string;
  recommendedBy: string; // User ID
  createdAt: string;
  tags: string[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: CourseStatus;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AppState {
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  feedback: Feedback[];
  currentUser: User | null;
}
