const { AuditLog } = require('../models');

async function logAudit({ actorId = null, action, entity, entityId = null, meta = {} }) {
  try {
    const log = await AuditLog.create({
      actorId,
      action,
      entity,
      entityId: entityId ? String(entityId) : null,
      meta,
      at: new Date()
    });
    return log;
  } catch (err) {
    console.error('[AuditLog] Failed to create audit log entry:', err.message);
    return null;
  }
}

module.exports = { logAudit };
