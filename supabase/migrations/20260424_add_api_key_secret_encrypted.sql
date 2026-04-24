-- Add encrypted secret column for key reveal feature
-- AES-256-GCM encrypted plaintext storage (format: iv:authTag:ciphertext as hex)
alter table public.api_keys add column if not exists secret_encrypted text;
