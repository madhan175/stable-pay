import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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