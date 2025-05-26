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
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'branch_manager' | 'staff' | 'accountant'
          branch_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: 'admin' | 'branch_manager' | 'staff' | 'accountant'
          branch_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'branch_manager' | 'staff' | 'accountant'
          branch_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Other tables can be added here
    }
  }
}