import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <Modal title="Confirm Action" onClose={onCancel}>
      <div className="confirm-dialog">
        <div className="confirm-icon">
          <AlertTriangle size={24} />
        </div>
        <div className="confirm-title">{title}</div>
        <div className="confirm-desc">{message}</div>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
