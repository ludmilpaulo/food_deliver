// components/QRCodeDisplay.tsx

import { useEffect, useState } from "react";
import Image from "next/image";

const QRCodeDisplay = () => {
  const [qrCodeURL, setQRCodeURL] = useState<string>("");

  useEffect(() => {
    const generateQR = async () => {
      // You can concatenate or format your QR code data as needed
      const data = `
        Merchant ID: 200002291819
        QR code ID: 231000065931718106
        Merchant Login Name: contato@sdkudya.com
        Merchant Name: Matadouro Impanga
        Bound Account: contato@sdkudya.com
      `;

      try {
        const QRCode = require("qrcode");
        const url = await QRCode.toDataURL(data);
        setQRCodeURL(url);
      } catch (err) {
        console.error(err);
      }
    };

    generateQR();
  }, []);

  return (
    <div className="mt-4">
      {qrCodeURL && (
        <Image
          width={300}
          height={300}
          src={qrCodeURL}
          alt="Generated QR Code"
        />
      )}
    </div>
  );
};

export default QRCodeDisplay;
