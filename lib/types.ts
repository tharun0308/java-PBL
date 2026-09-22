export type { Category, Priority, Status, Role } from './constants';
import { Category, Priority, Status, Role } from './constants';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface Complaint {
  id: string;
  complaintNumber: string; // e.g. "#SCMS-0001"
  complaint_number?: number | string;
  submittedById?: string;
  submittedByName?: string;
  submittedByEmail?: string;
  user_id?: string;
  category: Category;
  location: string;
  description: string;
  priority: Priority;
  status: Status;
  assignedToId?: string | null;
  assignedToName?: string | null;
  assigned_to?: string | null;
  resolutionNote?: string | null;
  resolution_note?: string | null;
  image_url?: string | null;
  resolution_image_url?: string | null;
  rating?: number | null;
  feedback_note?: string | null;
  rated_at?: string | null;
  createdAt: string;
  updatedAt: string;
  created_at?: string;
  updated_at?: string;
  user?: Profile;
  history?: ComplaintHistory[];
}

export interface ComplaintHistory {
  id: string;
  complaintId?: string;
  complaint_id?: string;
  oldStatus?: Status | null;
  old_status?: Status | null;
  newStatus: Status;
  new_status?: Status;
  note: string | null;
  updatedById?: string | null;
  updatedByName?: string | null;
  updated_by?: string | null;
  updatedAt: string;
  updated_at?: string;
  updater?: Profile;
}

export interface ComplaintWithHistory extends Complaint {
  history: ComplaintHistory[];
}

export interface Notification {
  id: string;
  user_id: string; // Target recipient (user ID or 'admin')
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  created_at: string;
}

export interface ReportSummary {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  overdue: number;
  averageRating: number | null;
  totalRatings: number;
  byCategory: {
    category: Category;
    count: number;
  }[];
  byPriority: {
    priority: Priority;
    count: number;
  }[];
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: Role;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: Role;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: Role;
          created_at?: string;
        };
        Relationships: [];
      };
      complaints: {
        Row: {
          id: string;
          complaint_number: number;
          user_id: string;
          category: Category;
          location: string;
          description: string;
          priority: Priority;
          status: Status;
          assigned_to: string | null;
          resolution_note: string | null;
          image_url?: string | null;
          resolution_image_url?: string | null;
          rating?: number | null;
          feedback_note?: string | null;
          rated_at?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          complaint_number?: number;
          user_id: string;
          category: Category;
          location: string;
          description: string;
          priority?: Priority;
          status?: Status;
          assigned_to?: string | null;
          resolution_note?: string | null;
          image_url?: string | null;
          resolution_image_url?: string | null;
          rating?: number | null;
          feedback_note?: string | null;
          rated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          complaint_number?: number;
          user_id?: string;
          category?: Category;
          location?: string;
          description?: string;
          priority?: Priority;
          status?: Status;
          assigned_to?: string | null;
          resolution_note?: string | null;
          image_url?: string | null;
          resolution_image_url?: string | null;
          rating?: number | null;
          feedback_note?: string | null;
          rated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "complaints_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      complaint_history: {
        Row: {
          id: string;
          complaint_id: string;
          old_status: Status | null;
          new_status: Status;
          note: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          complaint_id: string;
          old_status?: Status | null;
          new_status: Status;
          note?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          complaint_id?: string;
          old_status?: Status | null;
          new_status?: Status;
          note?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "complaint_history_complaint_id_fkey";
            columns: ["complaint_id"];
            isOneToOne: false;
            referencedRelation: "complaints";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "complaint_history_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      category: Category;
      priority: Priority;
      status: Status;
      role: Role;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
