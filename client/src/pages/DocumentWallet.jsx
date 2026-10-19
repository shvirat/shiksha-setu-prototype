import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadSimple, Trash, Eye, ArrowClockwise } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { apiRequest } from '../services/api';

export function DocumentWallet() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('st_certificate');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const docTypes = [
    { value: 'st_certificate', label: 'Scheduled Tribe Caste Certificate' },
    { value: 'income_certificate', label: 'Annual Income Certificate' },
    { value: 'marksheet', label: 'Previous Academic Marksheet' },
    { value: 'aadhaar_id', label: 'Aadhaar / Photo ID' },
    { value: 'bank_passbook', label: 'Bank Passbook / Account Mandate' }
  ];

  const loadDocuments = async () => {
    try {
      const res = await apiRequest('/documents');
      setDocuments(res.data.documents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);

      await apiRequest('/documents', {
        method: 'POST',
        body: formData
      });

      await loadDocuments();
    } catch (err) {
      setError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this document from your wallet?')) return;
    try {
      await apiRequest(`/documents/${id}`, { method: 'DELETE' });
      await loadDocuments();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-8 pb-20 sm:pb-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-h1 font-semibold text-ink tracking-tight">
          {t('wallet.heading')}
        </h1>
        <p className="text-lead text-ink-muted mt-1 font-sans max-w-2xl">
          {t('wallet.subheading')}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-danger-50 border border-danger-700 rounded text-small text-danger-700">
          {error}
        </div>
      )}

      {/* Upload Drag & Drop Area */}
      <div className="border border-line rounded bg-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <label className="text-small font-medium text-ink block mb-1">
              Select document type to upload:
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-11 px-3 text-small rounded border border-line-strong bg-surface text-ink w-full sm:w-72 focus-visible:outline-navy-600"
            >
              {docTypes.map((dt) => (
                <option key={dt.value} value={dt.value}>
                  {dt.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <UploadSimple size={18} className="mr-2" />
            {uploading ? 'Encrypting & Uploading...' : t('wallet.uploadButton')}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files[0])}
          />
        </div>

        {/* 1 px dashed line-strong drag dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          className="border border-dashed border-line-strong rounded p-8 text-center bg-paper cursor-pointer hover:bg-surface transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <p className="text-body font-medium text-ink">
            {t('wallet.dropzoneText')}
          </p>
          <p className="text-caption text-ink-muted mt-1">
            {t('wallet.dropzoneHint')}
          </p>
        </div>
      </div>

      {/* Document Table */}
      <section aria-labelledby="wallet-documents-heading" className="space-y-3">
        <h2 id="wallet-documents-heading" className="text-caption font-semibold text-ink-muted uppercase tracking-wider">
          Saved Verified Documents ({documents.length})
        </h2>

        {documents.length === 0 ? (
          <div className="border border-line rounded bg-surface p-8 text-center text-small text-ink-muted">
            <p>{t('wallet.emptyMessage')}</p>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                {t('wallet.uploadButton')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="border border-line rounded bg-surface divide-y divide-line overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line text-caption font-semibold text-ink-muted">
                  <th className="p-4">Type</th>
                  <th className="p-4">Document Name</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Uploaded</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const ext = doc.originalName.split('.').pop()?.toUpperCase() || 'PDF';
                  const uploadDate = new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={doc._id} className="border-b border-line hover:bg-paper transition-colors text-small">
                      {/* Mono Extension Tag */}
                      <td className="p-4 font-mono">
                        <span className="px-2 py-1 bg-navy-50 text-navy-700 text-caption font-bold rounded border border-navy-100">
                          {ext}
                        </span>
                      </td>

                      <td className="p-4 font-medium text-ink">
                        {doc.originalName}
                        <span className="block text-caption text-ink-subtle">
                          {doc.type.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="p-4 text-caption font-mono text-ink-muted">
                        {doc.source}
                      </td>

                      <td className="p-4 text-caption text-ink-muted">
                        {uploadDate}
                      </td>

                      <td className="p-4">
                        <Badge status={doc.status} />
                      </td>

                      <td className="p-4 text-right space-x-3">
                        <a
                          href={`/api/documents/${doc._id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-navy-600 hover:underline text-caption font-medium"
                        >
                          View
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedType(doc.type);
                            fileInputRef.current?.click();
                          }}
                          className="text-navy-600 hover:underline text-caption font-medium"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc._id)}
                          className="text-danger-700 hover:underline text-caption font-medium"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
