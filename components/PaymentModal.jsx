'use client'

import React, { useState } from 'react';

// Composant Modale de paiement
export default function PaymentModal({ onClose, onSubmit }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
      alert("Please fill in all card details.");
      setIsSubmitting(false);
      return;
    }

    onSubmit({ cardNumber, expiryDate, cvv, cardHolderName });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full relative transform transition-all scale-100 opacity-100">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
          onClick={onClose}
          aria-label="Close payment modal"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Enter Card Details (Fake)</h2>
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="cardHolderName">
              Cardholder Name
            </label>
             <input
              type="text"
              id="cardHolderName"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="cardNumber">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="XXXX XXXX XXXX XXXX"
              required
            />
          </div>
          <div className="flex mb-6 space-x-4">
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="expiryDate">
                Expiry Date (MM/YY)
              </label>
              <input
                type="text"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="MM/YY"
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="cvv">
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="XXX"
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleSubmit}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Save Card Details (Fake)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 