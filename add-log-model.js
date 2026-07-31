const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const logModel = `
// ============================================================
// AUDIT & ACTIVITY LOGS
// ============================================================

model ActivityLog {
  id         String   @id @default(cuid())
  businessId String?  
  userId     String?  
  userName   String?  
  action     String   
  entityType String?  
  entityId   String?  
  details    Json?    
  createdAt  DateTime @default(now())

  business   Business? @relation(fields: [businessId], references: [id], onDelete: Cascade)
  user       User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([businessId, createdAt])
  @@index([userId, createdAt])
}
`;

if (!schema.includes('model ActivityLog')) {
  schema += logModel;
  
  // Also need to add activityLogs to Business and User model if we want relations
  // But wait, it's easier to just append it and Prisma handles relation fields automatically on the other side?
  // No, Prisma requires relation fields on both sides if one side specifies fields.
  
  // Add to User
  schema = schema.replace(
    'mobileSessions MobileSession[]',
    'mobileSessions MobileSession[]\n  activityLogs   ActivityLog[]'
  );
  
  // Add to Business
  schema = schema.replace(
    'syncChanges    SyncChange[]',
    'syncChanges    SyncChange[]\n  activityLogs   ActivityLog[]'
  );

  fs.writeFileSync(schemaPath, schema);
  console.log('ActivityLog model added successfully.');
} else {
  console.log('ActivityLog model already exists.');
}
