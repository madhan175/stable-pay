import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we're in mock mode
const isMockMode = supabaseUrl.includes('placeholder');

// Create mock Supabase client for development
const createMockClient = () => {
  const createMockQuery = () => {
    const mockQuery = {
      select: () => mockQuery,
      eq: () => mockQuery,
      gt: () => mockQuery,
      order: () => mockQuery,
      limit: () => mockQuery,
      single: () => Promise.resolve({ data: null, error: { message: 'Mock mode - no data', code: 'PGRST116' } }),
      insert: (_data: any) => ({
        select: () => ({
          single: () => Promise.resolve({ 
            data: { 
              id: `mock_${Date.now()}`, 
              user_id: 'mock_user', 
              recipient_wallet: '0x1234...', 
              amount_inr: 1000, 
              amount_usd: 12, 
              requires_kyc: false, 
              status: 'pending',
              created_at: new Date().toISOString()
            }, 
            error: null 
          })
        })
      }),
      update: (_data: any) => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    };
    return mockQuery;
  };

  return {
    from: (_table: string) => createMockQuery(),
    storage: {
      from: (_bucket: string) => ({
        upload: (_path: string, _file: File) => Promise.resolve({ 
          data: { path: 'mock/path' }, 
          error: null 
        }),
        getPublicUrl: (_path: string) => ({ 
          data: { publicUrl: 'mock://storage.url' } 
        })
      })
    }
  };
};

// Create the appropriate client
const realClient = createClient(supabaseUrl, supabaseAnonKey);
const mockClient = createMockClient();

export const supabase = isMockMode ? mockClient as any : realClient;

// Uncomment the following lines when you have real Supabase credentials
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables');
// }

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string;
          phone_verified: boolean;
          kyc_status: 'none' | 'pending' | 'verified' | 'rejected';
          kyc_documents: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          phone_verified?: boolean;
          kyc_status?: 'none' | 'pending' | 'verified' | 'rejected';
          kyc_documents?: any[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          phone_verified?: boolean;
          kyc_status?: 'none' | 'pending' | 'verified' | 'rejected';
          kyc_documents?: any[];
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          recipient_wallet: string;
          amount_inr: number;
          amount_usd: number;
          requires_kyc: boolean;
          status: 'created' | 'pending' | 'completed' | 'blocked';
          tx_hash?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipient_wallet: string;
          amount_inr: number;
          amount_usd: number;
          requires_kyc: boolean;
          status?: 'created' | 'pending' | 'completed' | 'blocked';
          tx_hash?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipient_wallet?: string;
          amount_inr?: number;
          amount_usd?: number;
          requires_kyc?: boolean;
          status?: 'created' | 'pending' | 'completed' | 'blocked';
          tx_hash?: string;
        };
      };
      otp_codes: {
        Row: {
          id: string;
          phone: string;
          code: string;
          expires_at: string;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          code: string;
          expires_at: string;
          verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          code?: string;
          expires_at?: string;
          verified?: boolean;
        };
      };
    };
  };
};