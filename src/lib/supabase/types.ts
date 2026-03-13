export type ProspectStatus = 'pending' | 'in_progress' | 'completed' | 'expired'

export interface Database {
  public: {
    Tables: {
      prospects: {
        Row: {
          id: string
          token: string
          company_name: string | null
          contact_email: string | null
          contact_name: string | null
          status: ProspectStatus
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['prospects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['prospects']['Insert']>
      }
      questionnaire_responses: {
        Row: {
          id: string
          prospect_id: string
          answers: Record<string, Record<string, string>>
          current_section_index: number
          completed: boolean
          submitted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['questionnaire_responses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['questionnaire_responses']['Insert']>
      }
    }
  }
}
