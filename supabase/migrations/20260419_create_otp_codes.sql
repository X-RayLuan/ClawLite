-- OTP codes table for custom email OTP login
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by email + code
CREATE INDEX IF NOT EXISTS otp_codes_email_code_idx ON public.otp_codes (email, code_hash);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS otp_codes_expires_at_idx ON public.otp_codes (expires_at);

-- RLS: only admin can read/write
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Service role (admin) can do anything; no policies for other roles
CREATE POLICY "Service role can do everything on otp_codes"
  ON public.otp_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
