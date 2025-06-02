// src/components/PaymentDetails.tsx
import React from 'react';
import QRCode from 'qrcode.react';

type PaymentDetailsProps = {
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
};

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ paymentMethod, setPaymentMethod }) => {
  return (
    <div className="mb-6">
      <label className="block text-gray-700 mb-2">Método de pagamento:</label>
      <select className="w-full p-2 border border-gray-300 rounded" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
        <option value="Entrega">Pagar na entrega</option>
        <option value="TPA">Pagar na entrega com TPA</option>
        <option value="IBAN">Transferência pelo IBAN</option>
        <option value="PayPal">Pagar pelo PayPal</option>
      </select>

      {paymentMethod === "Entrega" && (
        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          Certifique-se de ter troco suficiente ou cartão para usar o TPA.
        </div>
      )}

      {paymentMethod === "IBAN" && (
        <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
          <p>Detalhes do banco:</p>
          <p>Banco: Banco XYZ</p>
          <p>IBAN: AO06 0006 0000 0000 0000 0011 2233</p>
        </div>
      )}

      {paymentMethod === "PayPal" && (
        <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
          <p>Escaneie o código QR abaixo para pagar com PayPal:</p>
          <QRCode value="https://www.paypal.com" size={128} />
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;
