'use client';

import { FC } from 'react';

interface AdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdvisorModal: FC<AdvisorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium">
            Hola
          </h3>
        </div>
      </div>
    </div>
  );
};

export default AdvisorModal;
