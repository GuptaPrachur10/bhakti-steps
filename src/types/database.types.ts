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
      attendance: {
        Row: {
          id: string
          created_at: string
          status: string
          mentee_id: string
          session_id: string
        }
      }
      batch_approval_requests: {
        Row: {
          id: string
          created_at: string
          mentor_id: string
          status: string
          proposed_schedule: string
          batch_name: string
          admin_note: string | null
          reviewed_at: string | null
          expected_mentees: number
        }
      }
      batch_memberships: {
        Row: {
          id: string
          joined_at: string
          mentee_id: string
          batch_id: string
          left_at: string | null
        }
      }
      batch_modules: {
        Row: {
          id: string
          created_at: string
          batch_id: string
          module_id: string
          started_at: string
          status: string
        }
      }
      batches: {
        Row: {
          id: string
          created_at: string
          mentor_id: string
          status: string
          location: string | null
          schedule: string
          name: string
        }
      }
      course_categories: {
        Row: {
          id: string
          created_at: string
          name: string
          sort_order: number
          active: boolean
        }
      }
      course_completions: {
        Row: {
          id: string
          user_id: string
          course_id: string
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          mentee_notes: string | null
          mentor_comment: string | null
          other_course_title: string | null
        }
      }
      courses: {
        Row: {
          id: string
          created_at: string
          title: string
          active: boolean
          category_id: string
        }
      }
      departments: {
        Row: {
          id: string
          created_at: string
          name: string
          active: boolean
          sort_order: number
        }
      }
      mentee_books: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          book_id: string
          user_id: string
          status: string
          owned: boolean
        }
      }

      modules: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          order_index: number
        }
      }
      prabhupada_books: {
        Row: {
          id: string
          created_at: string
          title: string
          category: string
          published_year: number | null
          active: boolean
        }
      }
      push_tokens: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          platform: string
          token: string
        }
      }
      sadhana_book_readings: {
        Row: {
          id: string
          created_at: string
          book_id: string
          sadhana_log_id: string
          other_book_title: string | null
          duration_minutes: number
        }
      }
      sadhana_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          date: string
          notes: string | null
          mangala_arati: boolean
          rounds: number
          japa_session: boolean
          mood: string | null
          score: number
          evening_kirtana: boolean
          tulasi_puja: boolean
          bg_class: boolean
          guru_puja: boolean
        }
      }
      service_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          department_id: string
          date: string
          description: string | null
          other_department_name: string | null
          duration_hours: number
        }
      }
      sessions: {
        Row: {
          id: string
          created_at: string
          batch_id: string
          session_date: string
        }
      }
      spiritual_masters: {
        Row: {
          id: string
          created_at: string
          name: string
          active: boolean
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string | null
          phone: string
          role: string
          full_name: string
          initiated_name: string | null
          is_initiated: boolean
          spiritual_master_id: string | null
          other_spiritual_master: string | null
          initiation_year: number | null
          address: string | null
          home_temple: string | null
          dob: string | null
          japa_target: number
        }
      }
    }
  }
}
