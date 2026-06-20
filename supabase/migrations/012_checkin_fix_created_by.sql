-- Fix created_by en cash_movements generados por check-in
-- auth.uid() retorna NULL en funciones SECURITY DEFINER porque el search_path no incluye 'auth'
-- Se agrega parámetro p_created_by para pasarlo desde la server action

CREATE OR REPLACE FUNCTION perform_checkin_v2(
  p_hotel_id         UUID,
  p_guest_id         UUID,
  p_room_id          UUID,
  p_price            NUMERIC,
  p_payment_method   TEXT,
  p_nights           INT,
  p_notes            TEXT DEFAULT NULL,
  p_price_per_night  NUMERIC DEFAULT NULL,
  p_room_number      TEXT DEFAULT '',
  p_guest_name       TEXT DEFAULT '',
  p_created_by       UUID DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_checkin_id UUID;
  v_user_id    UUID := COALESCE(p_created_by, auth.uid());
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = v_user_id AND hotel_id = p_hotel_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Acceso denegado');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM rooms
    WHERE id = p_room_id AND hotel_id = p_hotel_id AND status = 'available'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Habitación no disponible');
  END IF;

  UPDATE rooms SET type = 'simple'
  WHERE id = p_room_id AND type NOT IN ('simple','doble','triple','matrimonial','familiar','suite');

  INSERT INTO checkins (hotel_id, guest_id, room_id, price_per_night, total_price, payment_method, nights, notes, created_by, payment_status, status)
  VALUES (p_hotel_id, p_guest_id, p_room_id, COALESCE(p_price_per_night, p_price), p_price, p_payment_method, p_nights, p_notes, v_user_id, 'paid', 'active')
  RETURNING id INTO v_checkin_id;

  INSERT INTO cash_movements (hotel_id, amount, type, payment_method, checkin_id, created_by, category, description)
  VALUES (p_hotel_id, p_price, 'income', p_payment_method, v_checkin_id, v_user_id, 'checkin', CONCAT('Check-in Hab ', p_room_number, ' - ', p_guest_name));

  UPDATE rooms SET status = 'occupied' WHERE id = p_room_id;

  RETURN json_build_object('success', true, 'checkin_id', v_checkin_id);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
