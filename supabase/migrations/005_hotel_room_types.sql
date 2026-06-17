CREATE TABLE IF NOT EXISTS hotel_room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hotel_id, name)
);

INSERT INTO hotel_room_types (hotel_id, name, label)
SELECT h.id, v.name, v.label
FROM hotels h
CROSS JOIN (
  VALUES ('simple', 'Simple'), ('doble', 'Doble'), ('triple', 'Triple'),
         ('matrimonial', 'Matrimonial'), ('familiar', 'Familiar'), ('suite', 'Suite')
) AS v(name, label)
ON CONFLICT (hotel_id, name) DO NOTHING;
