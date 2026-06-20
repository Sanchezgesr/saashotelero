-- Fix notas_venta: add UPDATE/DELETE policies (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notas_venta_update' AND tablename = 'notas_venta') THEN
    CREATE POLICY notas_venta_update ON notas_venta FOR UPDATE USING (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notas_venta_delete' AND tablename = 'notas_venta') THEN
    CREATE POLICY notas_venta_delete ON notas_venta FOR DELETE USING (hotel_id = get_my_hotel_id());
  END IF;
END $$;

-- Fix csrf_tokens: add user_id column and restrict by user_id
ALTER TABLE csrf_tokens ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

DROP POLICY IF EXISTS csrf_tokens_select ON csrf_tokens;
DROP POLICY IF EXISTS csrf_tokens_insert ON csrf_tokens;
DROP POLICY IF EXISTS csrf_tokens_delete ON csrf_tokens;

CREATE POLICY csrf_tokens_select ON csrf_tokens FOR SELECT USING (user_id = auth.uid());
CREATE POLICY csrf_tokens_insert ON csrf_tokens FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY csrf_tokens_delete ON csrf_tokens FOR DELETE USING (user_id = auth.uid());

-- Fix dashboard RPC: remove anon grant
REVOKE EXECUTE ON FUNCTION get_dashboard_data FROM anon;
