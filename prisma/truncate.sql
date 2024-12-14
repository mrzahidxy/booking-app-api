DO $$

-- DECLARE
--     table_name TEXT := 'your_table_name'; -- Specify your table name here
-- BEGIN
--     EXECUTE 'TRUNCATE TABLE "' || table_name || '" RESTART IDENTITY CASCADE;';

DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'TRUNCATE TABLE "' || table_name || '" RESTART IDENTITY CASCADE;';
    END LOOP;
END $$;
