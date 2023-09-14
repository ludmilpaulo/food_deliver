import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import QRCodeDisplay from "../components/QRCodeDisplay";

const PaymentScreen = () => {
  const [paymentMethod, setPaymentMethod] = useState("");

  const handlePayment = () => {
    switch (paymentMethod) {
      case "paypal":
        // Handle PayPal payment
        break;
      case "paypal-qr":
        // Handle PayPal QR Code payment
        break;
      case "delivery":
        // Handle Pay on Delivery
        break;
      default:
        alert("Please select a payment method");
        break;
    }
  };

  return (
    <>
      <Nav />
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="p-8 border border-gray-200 rounded-md">
          <h2 className="text-2xl font-bold mb-8">
            Escolha o método de pagamento
          </h2>
          <div>
            <label>
              <input
                type="radio"
                value="paypal-qr"
                checked={paymentMethod === "paypal-qr"}
                onChange={() => setPaymentMethod("paypal-qr")}
              />
              <span className="ml-2">Pay with PayPal using QR code</span>
              {paymentMethod === "paypal-qr" && (
                <div className="mt-4">
                  <QRCodeDisplay />
                </div>
              )}
            </label>
          </div>
          <div className="mt-4">
            <label>
              <input
                type="radio"
                value="paypal"
                checked={paymentMethod === "paypal"}
                onChange={() => setPaymentMethod("paypal")}
              />
              <span className="ml-2">Pay with PayPal</span>
            </label>
          </div>
          <div className="mt-4">
            <label>
              <input
                type="radio"
                value="delivery"
                checked={paymentMethod === "delivery"}
                onChange={() => setPaymentMethod("delivery")}
              />
              <span className="ml-2">Pay on Delivery</span>
            </label>
          </div>
          <div className="mt-8">
            <button
              onClick={handlePayment}
              className="bg-blue-500 text-white rounded py-2 px-4"
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentScreen;
