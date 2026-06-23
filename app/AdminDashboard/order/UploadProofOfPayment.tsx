import React, { useState } from 'react';
import { uploadAdminOrderProof } from '@/features/admin/api/adminOrdersApi';
import { useTranslation } from '@/hooks/useTranslation';

interface UploadProofOfPaymentProps {
  orderId: number;
  party: 'store' | 'driver';
  onUploaded?: () => void;
}

const UploadProofOfPayment: React.FC<UploadProofOfPaymentProps> = ({
  orderId,
  party,
  onUploaded,
}) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const response = await uploadAdminOrderProof(orderId, party, file);
      setUploadStatus(response.message ?? t('uploadSuccess', 'Uploaded successfully'));
      onUploaded?.();
    } catch {
      setUploadStatus(t('errorUploadingProof', 'Error uploading proof of payment'));
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button type="button" onClick={handleUpload}>
        {t('uploadProofOfPayment', 'Upload Proof of Payment')}
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default UploadProofOfPayment;
