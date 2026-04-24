-- License keys table for ClawLite Installer activation
CREATE TABLE IF NOT EXISTS public.license_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  api_key_hash TEXT NOT NULL,
  api_key_prefix TEXT NOT NULL,
  device_id TEXT NOT NULL,
  license_type TEXT NOT NULL DEFAULT 'free',
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_license_keys_email ON public.license_keys(email);
CREATE INDEX IF NOT EXISTS idx_license_keys_api_key_prefix ON public.license_keys(api_key_prefix);
CREATE INDEX IF NOT EXISTS idx_license_keys_device_id ON public.license_keys(device_id);
CREATE INDEX IF NOT EXISTS idx_license_keys_status ON public.license_keys(status);

-- Verification codes for email-based license activation
CREATE TABLE IF NOT EXISTS public.license_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  device_id TEXT NOT NULL,
  platform TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_license_verification_codes_email ON public.license_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_license_verification_codes_expires_at ON public.license_verification_codes(expires_at);

-- RLS
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_verification_codes ENABLE ROW LEVEL SECURITY;

-- Service role (admin) can do anything
CREATE POLICY "Service role can do everything on license_keys"
  ON public.license_keys
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on license_verification_codes"
  ON public.license_verification_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Revoke all from anon/authenticated
REVOKE ALL ON TABLE public.license_keys FROM anon, authenticated;
REVOKE ALL ON TABLE public.license_verification_codes FROM anon, authenticated;
