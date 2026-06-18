-- encrypted PII columns for guests
-- phone y email se cifran con AES-256-GCM via app layer (GUEST_ENCRYPTION_KEY)
-- DNI se mantiene en texto plano (requerido por SUNAT para facturación)

ALTER TABLE guests ADD COLUMN IF NOT EXISTS encrypted_phone text;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS encrypted_email text;

-- RLS: solo usuarios autenticados pueden leer columnas cifradas
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guests_select_own_hotel" ON guests
  FOR SELECT USING (
    hotel_id = get_my_hotel_id()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "guests_insert_own_hotel" ON guests
  FOR INSERT WITH CHECK (
    hotel_id = get_my_hotel_id()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "guests_update_own_hotel" ON guests
  FOR UPDATE USING (
    hotel_id = get_my_hotel_id()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );
