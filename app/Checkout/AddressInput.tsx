import React from 'react';

type AddressInputProps = {
  useCurrentLocation: boolean;
  setUseCurrentLocation: (value: boolean) => void;
  userAddress: string;
  setUserAddress: (value: string) => void;
};

const AddressInput: React.FC<AddressInputProps> = ({ useCurrentLocation, setUseCurrentLocation, userAddress, setUserAddress }) => {
  return (
    <div className="mb-6">
      <label className="block text-gray-700 mb-2">Escolher o endereço de entrega:</label>
      <div className="flex items-center mb-4">
        <input
          type="radio"
          id="currentLocation"
          name="deliveryLocation"
          value="currentLocation"
          checked={useCurrentLocation}
          onChange={() => setUseCurrentLocation(true)}
          className="mr-2"
        />
        <label htmlFor="currentLocation" className="text-gray-700">Usar localização atual</label>
      </div>
      <div className="flex items-center mb-4">
        <input
          type="radio"
          id="manualAddress"
          name="deliveryLocation"
          value="manualAddress"
          checked={!useCurrentLocation}
          onChange={() => setUseCurrentLocation(false)}
          className="mr-2"
        />
        <label htmlFor="manualAddress" className="text-gray-700">Escrever o endereço de entrega</label>
      </div>
      {!useCurrentLocation && (
        <input
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Adicione seu endereço"
          onChange={(e) => setUserAddress(e.target.value)}
          value={userAddress}
        />
      )}
    </div>
  );
};

export default AddressInput;
