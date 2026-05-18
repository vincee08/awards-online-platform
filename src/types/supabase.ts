export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          auth_user_id: string
          full_name: string | null
          email: string
          avatar_url: string | null
          role: 'super_admin' | 'admin'
          status: 'pending' | 'approved' | 'rejected' | 'disabled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          full_name?: string | null
          email: string
          avatar_url?: string | null
          role?: 'super_admin' | 'admin'
          status?: 'pending' | 'approved' | 'rejected' | 'disabled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          full_name?: string | null
          email?: string
          avatar_url?: string | null
          role?: 'super_admin' | 'admin'
          status?: 'pending' | 'approved' | 'rejected' | 'disabled'
          created_at?: string
          updated_at?: string
        }
      }
      awards: {
        Row: {
          id: string
          award_name: string
          short_description: string
          student_names: string | null
          program: string
          faculty_coach: string | null
          date_awarded: string
          award_giving_body: string
          post_link: string | null
          image_url: string | null
          uploaded_image_path: string | null
          visibility_status: 'published' | 'draft' | 'hidden'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          award_name: string
          short_description: string
          student_names?: string | null
          program: string
          faculty_coach?: string | null
          date_awarded: string
          award_giving_body: string
          post_link?: string | null
          image_url?: string | null
          uploaded_image_path?: string | null
          visibility_status?: 'published' | 'draft' | 'hidden'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          award_name?: string
          short_description?: string
          student_names?: string | null
          program?: string
          faculty_coach?: string | null
          date_awarded?: string
          award_giving_body?: string
          post_link?: string | null
          image_url?: string | null
          uploaded_image_path?: string | null
          visibility_status?: 'published' | 'draft' | 'hidden'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          admin_user_id: string | null
          action: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_user_id?: string | null
          action: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_user_id?: string | null
          action?: string
          description?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
