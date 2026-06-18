-- RLS para tablas creadas en migraciones posteriores a schema.sql

ALTER TABLE hotel_fiscal_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE csrf_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY hotel_fiscal_config_select ON hotel_fiscal_config
  FOR SELECT USING (hotel_id = get_my_hotel_id());
CREATE POLICY hotel_fiscal_config_insert ON hotel_fiscal_config
  FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id());
CREATE POLICY hotel_fiscal_config_update ON hotel_fiscal_config
  FOR UPDATE USING (hotel_id = get_my_hotel_id());

CREATE POLICY invoices_select ON invoices
  FOR SELECT USING (hotel_id = get_my_hotel_id());
CREATE POLICY invoices_insert ON invoices
  FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id());

CREATE POLICY hotel_room_types_select ON hotel_room_types
  FOR SELECT USING (hotel_id = get_my_hotel_id());
CREATE POLICY hotel_room_types_insert ON hotel_room_types
  FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id());
CREATE POLICY hotel_room_types_update ON hotel_room_types
  FOR UPDATE USING (hotel_id = get_my_hotel_id());
CREATE POLICY hotel_room_types_delete ON hotel_room_types
  FOR DELETE USING (hotel_id = get_my_hotel_id());

CREATE POLICY csrf_tokens_select ON csrf_tokens
  FOR SELECT USING (true);
CREATE POLICY csrf_tokens_insert ON csrf_tokens
  FOR INSERT WITH CHECK (true);
CREATE POLICY csrf_tokens_delete ON csrf_tokens
  FOR DELETE USING (true);

-- Reservations: agregar policies faltantes
CREATE POLICY reservations_insert ON reservations
  FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id());
CREATE POLICY reservations_update ON reservations
  FOR UPDATE USING (hotel_id = get_my_hotel_id());
CREATE POLICY reservations_delete ON reservations
  FOR DELETE USING (hotel_id = get_my_hotel_id());
