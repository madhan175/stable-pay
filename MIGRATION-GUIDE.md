# Migration Guide: Transaction History Fix

## Quick Start

### Step 1: Run Database Migration
Execute the SQL migration in your Supabase dashboard:

```sql
-- Add sender_wallet column
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS sender_wallet VARCHAR(42);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_sender_wallet ON transactions(sender_wallet);
CREATE INDEX IF NOT EXISTS idx_transactions_recipient_wallet ON transactions(recipient_wallet);
```

**Location:** Open Supabase Dashboard → SQL Editor → Paste above SQL → Run

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

This will install the new `pdfkit` dependency.

### Step 3: Restart Services
```bash
# Backend
cd backend
npm start

# Frontend (if not auto-reloading)
cd frontend
npm run dev
```

## Verification

### Check Transaction History Saving
1. Make a payment from Wallet A to Wallet B
2. Check History page for both wallets
3. Both should show the transaction

### Check Receipt Download
1. Complete a transaction
2. Open History page
3. Find the completed transaction
4. Click "Receipt" button
5. PDF should download

## Troubleshooting

### "Column sender_wallet does not exist"
- Run the migration SQL in Supabase
- Verify column exists: `SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions';`

### "pdfkit not found"
- Run: `cd backend && npm install`

### Receipt button not showing
- Check transaction comes from Supabase (not contract/merchant payments)
- Check transaction status is "completed"/"confirmed"

## Rollback

If you need to rollback:

```sql
-- Remove column (will lose data!)
ALTER TABLE transactions DROP COLUMN IF EXISTS sender_wallet;
DROP INDEX IF EXISTS idx_transactions_sender_wallet;
DROP INDEX IF EXISTS idx_transactions_recipient_wallet;
```

## Support

For issues, check:
- Backend logs: `cd backend && npm start` (watch console)
- Frontend console: Browser DevTools → Console
- Database: Supabase Dashboard → Table Editor → transactions


