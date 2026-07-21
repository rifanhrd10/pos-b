CREATE TRIGGER "Table_mobile_sync_change"
AFTER INSERT OR UPDATE OR DELETE ON "Table"
FOR EACH ROW EXECUTE FUNCTION "record_mobile_sync_change"('table');
