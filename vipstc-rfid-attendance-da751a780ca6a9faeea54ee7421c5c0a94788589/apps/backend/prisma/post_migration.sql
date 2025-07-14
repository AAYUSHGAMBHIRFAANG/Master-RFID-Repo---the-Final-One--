/* Ensure rfidUid is unique across Student and Faculty */
CREATE OR REPLACE FUNCTION validate_unique_rfid() RETURNS TRIGGER AS $$
DECLARE
    exists_in_student  INTEGER;
    exists_in_faculty  INTEGER;
BEGIN
    IF TG_TABLE_NAME = 'Student' THEN
        SELECT 1 INTO exists_in_faculty
        FROM "Faculty"
        WHERE "rfidUid" = NEW."rfidUid"
        LIMIT 1;
        IF exists_in_faculty IS NOT NULL THEN
            RAISE EXCEPTION 'RFID % already assigned to a faculty member', NEW."rfidUid";
        END IF;

    ELSIF TG_TABLE_NAME = 'Faculty' THEN
        SELECT 1 INTO exists_in_student
        FROM "Student"
        WHERE "rfidUid" = NEW."rfidUid"
        LIMIT 1;
        IF exists_in_student IS NOT NULL THEN
            RAISE EXCEPTION 'RFID % already assigned to a student', NEW."rfidUid";
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_unique_rfid_student ON "Student";
DROP TRIGGER IF EXISTS trg_unique_rfid_faculty ON "Faculty";

CREATE CONSTRAINT TRIGGER trg_unique_rfid_student
AFTER INSERT OR UPDATE OF "rfidUid" ON "Student"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION validate_unique_rfid();

CREATE CONSTRAINT TRIGGER trg_unique_rfid_faculty
AFTER INSERT OR UPDATE OF "rfidUid" ON "Faculty"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION validate_unique_rfid();
