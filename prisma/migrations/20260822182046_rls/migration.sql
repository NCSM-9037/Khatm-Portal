-- Ensure auth schema and uid() exist for Prisma shadow database
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    EXECUTE 'CREATE SCHEMA auth';
    EXECUTE 'CREATE FUNCTION auth.uid() RETURNS UUID AS ''SELECT NULL::UUID;'' LANGUAGE SQL';
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Family" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Khatm" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JuzAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reminder" ENABLE ROW LEVEL SECURITY;

-- Helper function to check if a user is an active member of a family
CREATE OR REPLACE FUNCTION user_has_active_membership(p_family_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "Membership"
    WHERE "family_id" = p_family_id
      AND "user_id" = auth.uid()
      AND "status" = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Family Policies
-- A user can create a family. They can read/update it if they are an active member.
CREATE POLICY "Family_insert" ON "Family" FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Family_access" ON "Family" FOR SELECT USING (user_has_active_membership(id));
CREATE POLICY "Family_update" ON "Family" FOR UPDATE USING (user_has_active_membership(id));
CREATE POLICY "Family_delete" ON "Family" FOR DELETE USING (user_has_active_membership(id));

-- Membership Policies
-- A user can see and modify memberships of a family they are a member of, or they can insert if it's for themselves
CREATE POLICY "Membership_insert" ON "Membership" FOR INSERT WITH CHECK (user_id = auth.uid() OR user_has_active_membership(family_id));
CREATE POLICY "Membership_access" ON "Membership" FOR SELECT USING (user_id = auth.uid() OR user_has_active_membership(family_id));
CREATE POLICY "Membership_update" ON "Membership" FOR UPDATE USING (user_has_active_membership(family_id));
CREATE POLICY "Membership_delete" ON "Membership" FOR DELETE USING (user_has_active_membership(family_id));

-- Khatm Policies
CREATE POLICY "Khatm_insert" ON "Khatm" FOR INSERT WITH CHECK (user_has_active_membership(family_id));
CREATE POLICY "Khatm_access" ON "Khatm" FOR SELECT USING (user_has_active_membership(family_id));
CREATE POLICY "Khatm_update" ON "Khatm" FOR UPDATE USING (user_has_active_membership(family_id));
CREATE POLICY "Khatm_delete" ON "Khatm" FOR DELETE USING (user_has_active_membership(family_id));

-- ActivityLog Policies
CREATE POLICY "ActivityLog_insert" ON "ActivityLog" FOR INSERT WITH CHECK (user_has_active_membership(family_id));
CREATE POLICY "ActivityLog_access" ON "ActivityLog" FOR SELECT USING (user_has_active_membership(family_id));
CREATE POLICY "ActivityLog_delete" ON "ActivityLog" FOR DELETE USING (user_has_active_membership(family_id));

-- JuzAssignment Policies
-- Indirect family_id via Khatm
CREATE POLICY "JuzAssignment_access" ON "JuzAssignment" FOR ALL USING (
  EXISTS (
    SELECT 1 FROM "Khatm"
    WHERE "Khatm"."id" = "JuzAssignment"."khatm_id"
      AND user_has_active_membership("Khatm"."family_id")
  )
);

-- Reminder Policies
-- Indirect via JuzAssignment -> Khatm
CREATE POLICY "Reminder_access" ON "Reminder" FOR ALL USING (
  EXISTS (
    SELECT 1 FROM "JuzAssignment"
    JOIN "Khatm" ON "Khatm"."id" = "JuzAssignment"."khatm_id"
    WHERE "JuzAssignment"."id" = "Reminder"."juz_assignment_id"
      AND user_has_active_membership("Khatm"."family_id")
  )
);

-- User Policies
-- Users can see their own profile, or profiles of users in the same family.
CREATE POLICY "User_access" ON "User" FOR SELECT USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM "Membership" m1
    JOIN "Membership" m2 ON m1.family_id = m2.family_id
    WHERE m1.user_id = "User".id
      AND m2.user_id = auth.uid()
      AND m2.status = 'ACTIVE'
  )
);
CREATE POLICY "User_update" ON "User" FOR UPDATE USING (id = auth.uid());
CREATE POLICY "User_insert" ON "User" FOR INSERT WITH CHECK (id = auth.uid());