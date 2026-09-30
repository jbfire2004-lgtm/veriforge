-- Least-privilege Postgres roles for VeriForge (run as superuser once).
-- App connects as veriforge_app (DML only). Migrations use veriforge_migrator (DDL).

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'veriforge_migrator') THEN
    CREATE ROLE veriforge_migrator LOGIN PASSWORD 'CHANGE_ME_MIGRATOR';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'veriforge_app') THEN
    CREATE ROLE veriforge_app LOGIN PASSWORD 'CHANGE_ME_APP';
  END IF;
END $$;

GRANT CONNECT ON DATABASE veriforge TO veriforge_migrator, veriforge_app;
GRANT USAGE, CREATE ON SCHEMA public TO veriforge_migrator;
GRANT USAGE ON SCHEMA public TO veriforge_app;

-- After migrations, grant DML to app role:
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO veriforge_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO veriforge_app;
ALTER DEFAULT PRIVILEGES FOR ROLE veriforge_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO veriforge_app;
ALTER DEFAULT PRIVILEGES FOR ROLE veriforge_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO veriforge_app;

-- Optional: revoke public
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- At-rest encryption: enable on the volume / cloud disk (AWS RDS encryption, GCP CMEK, etc.)
-- Application-level PII: FIELD_ENCRYPTION_KEY + encryptField() for sensitive columns.
