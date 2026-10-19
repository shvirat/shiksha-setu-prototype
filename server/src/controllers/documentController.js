const fs = require('fs');
const path = require('path');
const { Document } = require('../models');
const { encryptBuffer, decryptBuffer } = require('../utils/crypto');
const { logAudit } = require('../services/auditService');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'FILE_MISSING', message: 'No file uploaded' }
      });
    }

    const { type } = req.body;
    const validTypes = ['st_certificate', 'income_certificate', 'marksheet', 'aadhaar_id', 'bank_passbook', 'other'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DOCUMENT_TYPE',
          message: `Document type must be one of: ${validTypes.join(', ')}`
        }
      });
    }

    // Encrypt uploaded file buffer using AES-256-GCM
    const encryptedData = encryptBuffer(req.file.buffer);
    const fileName = `doc_${req.user._id}_${type}_${Date.now()}.enc`;
    const storedPath = path.join(UPLOADS_DIR, fileName);

    fs.writeFileSync(storedPath, encryptedData);

    // Set expiry for income certificate to 1 year from upload
    let expiresAt = null;
    if (type === 'income_certificate') {
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      expiresAt = oneYearLater;
    }

    // Check if user already uploaded this document type, mark previous as replaced or remove
    const existing = await Document.findOne({ userId: req.user._id, type });
    if (existing) {
      if (fs.existsSync(existing.storedPath)) {
        try {
          fs.unlinkSync(existing.storedPath);
        } catch (_) {}
      }
      await Document.deleteOne({ _id: existing._id });
    }

    const document = await Document.create({
      userId: req.user._id,
      type,
      originalName: req.file.originalname,
      storedPath,
      encrypted: true,
      status: 'VERIFIED',
      source: 'STUDENT_UPLOAD',
      uploadedAt: new Date(),
      expiresAt
    });

    await logAudit({
      actorId: req.user._id,
      action: 'DOCUMENT_UPLOADED',
      entity: 'Document',
      entityId: document._id,
      meta: { type, originalName: req.file.originalname, sizeBytes: req.file.size }
    });

    res.status(201).json({
      success: true,
      data: { document }
    });
  } catch (error) {
    next(error);
  }
}

async function listDocuments(req, res, next) {
  try {
    const documents = await Document.find({ userId: req.user._id }).sort({ uploadedAt: -1 });
    res.json({
      success: true,
      data: { documents }
    });
  } catch (error) {
    next(error);
  }
}

async function downloadDocument(req, res, next) {
  try {
    const { id } = req.params;
    const document = await Document.findOne({ _id: id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' }
      });
    }

    if (!fs.existsSync(document.storedPath)) {
      return res.status(404).json({
        success: false,
        error: { code: 'FILE_NOT_FOUND', message: 'Physical file not found on disk' }
      });
    }

    const encryptedData = fs.readFileSync(document.storedPath);
    let plainData;
    if (document.encrypted) {
      plainData = decryptBuffer(encryptedData);
    } else {
      plainData = encryptedData;
    }

    const ext = path.extname(document.originalName).toLowerCase();
    const mimeMap = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
    res.send(plainData);
  } catch (error) {
    next(error);
  }
}

async function deleteDocument(req, res, next) {
  try {
    const { id } = req.params;
    const document = await Document.findOne({ _id: id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Document not found' }
      });
    }

    if (fs.existsSync(document.storedPath)) {
      try {
        fs.unlinkSync(document.storedPath);
      } catch (_) {}
    }

    await Document.deleteOne({ _id: id });

    await logAudit({
      actorId: req.user._id,
      action: 'DOCUMENT_DELETED',
      entity: 'Document',
      entityId: id,
      meta: { type: document.type, originalName: document.originalName }
    });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadDocument,
  listDocuments,
  downloadDocument,
  deleteDocument
};
