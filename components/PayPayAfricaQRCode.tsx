import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

const PayPayAfricaQRCode = () => {
  const [qrCodeURL, setQRCodeURL] = useState<string>("");

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Mock-up endpoint and payload
        const response = await axios.post(
          "https://api.paypayafrica.com/generateQR",
          {
            merchantId: "200002291819",
            loginName: "contato@sdkudya.com",
            // ... other necessary data
          },
        );

        // Assuming the API returns a URL for the QR code
        setQRCodeURL(response.data.qrCodeURL);
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
          alt="PayPay Africa QR Code"
        />
      )}
    </div>
  );
};

export default PayPayAfricaQRCode;
