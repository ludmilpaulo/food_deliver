import React, { useState } from 'react';
import axios from 'axios';

interface UploadProofOfPaymentProps {
  orderId: number;
  uploadUrl: string;
}

const UploadProofOfPayment: React.FC<UploadProofOfPaymentProps> = ({ orderId, uploadUrl }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('proof_of_payment', file);
      try {
        const response = await axios.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setUploadStatus(response.data.message);
      } catch (error) {
        setUploadStatus('Error uploading proof of payment');
      }
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Proof of Payment</button>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default UploadProofOfPayment;
