const express = require('express');
const {
  uploadDocument,
  listDocuments,
  downloadDocument,
  deleteDocument
} = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);

router.post('/', upload.single('file'), uploadDocument);
router.get('/', listDocuments);
router.get('/:id/download', downloadDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
