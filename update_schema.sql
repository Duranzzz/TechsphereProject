-- Allow NULL empleado_id in ventas (for public sales)
ALTER TABLE ventas ALTER COLUMN empleado_id DROP NOT NULL;

-- Link empleados to auth_users (optional but good for future)
ALTER TABLE empleados ADD COLUMN auth_user_id INTEGER REFERENCES auth_users(id);
