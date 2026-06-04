-- 004: RPC de dashboard que reemplaza 23 queries individuales con 1 llamada.
-- Devuelve JSON con todos los KPI, room map y datos de chart semanal.

CREATE OR REPLACE FUNCTION get_dashboard_data(p_hotel_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today       DATE := (CURRENT_DATE AT TIME ZONE 'America/Lima');
  v_yesterday   DATE := v_today - 1;
  v_today_start TIMESTAMPTZ := v_today::TIMESTAMPTZ AT TIME ZONE 'America/Lima';
  v_today_end   TIMESTAMPTZ := (v_today + 1)::TIMESTAMPTZ AT TIME ZONE 'America/Lima';
  v_y_start     TIMESTAMPTZ := v_yesterday::TIMESTAMPTZ AT TIME ZONE 'America/Lima';
  v_y_end       TIMESTAMPTZ := v_today::TIMESTAMPTZ AT TIME ZONE 'America/Lima';
  v_result      JSON;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND hotel_id = p_hotel_id)
     AND NOT is_super_admin() THEN
    RETURN json_build_object('error', 'Acceso denegado');
  END IF;

  WITH room_stats AS (
    SELECT
      COUNT(*) FILTER (WHERE status = 'available')   AS free,
      COUNT(*) FILTER (WHERE status = 'occupied')    AS occupied,
      COUNT(*) FILTER (WHERE status = 'cleaning')    AS cleaning,
      COUNT(*) FILTER (WHERE status = 'maintenance') AS maintenance
    FROM rooms WHERE hotel_id = p_hotel_id
  ),
  today_checkins AS (
    SELECT COUNT(*) AS cnt FROM checkins
    WHERE hotel_id = p_hotel_id AND check_in_at >= v_today_start AND check_in_at < v_today_end
  ),
  today_checkouts AS (
    SELECT COUNT(*) AS cnt FROM checkins
    WHERE hotel_id = p_hotel_id AND status = 'checked_out'
      AND check_out_at >= v_today_start AND check_out_at < v_today_end
  ),
  yesterday_checkins AS (
    SELECT COUNT(*) AS cnt FROM checkins
    WHERE hotel_id = p_hotel_id AND check_in_at >= v_y_start AND check_in_at < v_y_end
  ),
  yesterday_checkouts AS (
    SELECT COUNT(*) AS cnt FROM checkins
    WHERE hotel_id = p_hotel_id AND status = 'checked_out'
      AND check_out_at >= v_y_start AND check_out_at < v_y_end
  ),
  today_income AS (
    SELECT COALESCE(SUM(amount), 0) AS total FROM cash_movements
    WHERE hotel_id = p_hotel_id AND type = 'income'
      AND created_at >= v_today_start AND created_at < v_today_end
  ),
  today_expense AS (
    SELECT COALESCE(SUM(amount), 0) AS total FROM cash_movements
    WHERE hotel_id = p_hotel_id AND type = 'expense'
      AND created_at >= v_today_start AND created_at < v_today_end
  ),
  yesterday_income AS (
    SELECT COALESCE(SUM(amount), 0) AS total FROM cash_movements
    WHERE hotel_id = p_hotel_id AND type = 'income'
      AND created_at >= v_y_start AND created_at < v_y_end
  ),
  active_guests AS (
    SELECT COUNT(*) AS cnt FROM checkins
    WHERE hotel_id = p_hotel_id AND status = 'active'
  ),
  rooms_json AS (
    SELECT json_agg(
      json_build_object(
        'id', r.id, 'number', r.number, 'floor', r.floor,
        'status', r.status, 'type', r.type, 'price_per_night', r.price_per_night
      ) ORDER BY r.number
    ) AS rooms FROM rooms r WHERE r.hotel_id = p_hotel_id
  ),
  weekly AS (
    SELECT json_agg(
      json_build_object(
        'date', d::TEXT,
        'income', COALESCE(i.total, 0),
        'expense', COALESCE(e.total, 0)
      ) ORDER BY d
    ) AS data
    FROM generate_series(v_today - 6, v_today, '1 day'::INTERVAL) d
    LEFT JOIN LATERAL (
      SELECT SUM(amount) AS total FROM cash_movements
      WHERE hotel_id = p_hotel_id AND type = 'income'
        AND created_at >= d::TIMESTAMPTZ AT TIME ZONE 'America/Lima'
        AND created_at < (d + 1)::TIMESTAMPTZ AT TIME ZONE 'America/Lima'
    ) i ON true
    LEFT JOIN LATERAL (
      SELECT SUM(amount) AS total FROM cash_movements
      WHERE hotel_id = p_hotel_id AND type = 'expense'
        AND created_at >= d::TIMESTAMPTZ AT TIME ZONE 'America/Lima'
        AND created_at < (d + 1)::TIMESTAMPTZ AT TIME ZONE 'America/Lima'
    ) e ON true
  )
  SELECT json_build_object(
    'rooms',        COALESCE((SELECT rooms FROM rooms_json), '[]'::JSON),
    'free',         (SELECT free FROM room_stats),
    'occupied',     (SELECT occupied FROM room_stats),
    'cleaning',     (SELECT cleaning FROM room_stats),
    'maintenance',  (SELECT maintenance FROM room_stats),
    'todayCheckins',   (SELECT cnt FROM today_checkins),
    'todayCheckouts',  (SELECT cnt FROM today_checkouts),
    'yesterdayCheckins',  (SELECT cnt FROM yesterday_checkins),
    'yesterdayCheckouts', (SELECT cnt FROM yesterday_checkouts),
    'todayIncome',   (SELECT total FROM today_income),
    'todayExpense',  (SELECT total FROM today_expense),
    'yesterdayIncome', (SELECT total FROM yesterday_income),
    'activeGuests',  (SELECT cnt FROM active_guests),
    'weekly',        COALESCE((SELECT data FROM weekly), '[]'::JSON)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Índice para consultas de auditoría por hotel
CREATE INDEX IF NOT EXISTS idx_audit_log_hotel_date
  ON audit_log(hotel_id, created_at DESC);

-- Permitir a usuarios autenticados ejecutar la función
GRANT EXECUTE ON FUNCTION get_dashboard_data TO authenticated, anon;
