DROP POLICY IF EXISTS "ActivityLog_access" ON "ActivityLog"; CREATE POLICY "ActivityLog_access" ON "ActivityLog" FOR SELECT USING (true);
