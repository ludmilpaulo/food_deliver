import React, { useState } from "react";

const DatabaseActions = () => {
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    const response = await fetch('/api/backup/', { method: 'GET' });
    const data = await response.json();
    alert(data.message);
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    const response = await fetch('/api/delete/', { method: 'GET' });
    const data = await response.json();
    alert(data.message);
    setLoading(false);
  };

  const handleLoad = async () => {
    setLoading(true);
    const response = await fetch('/api/load/', { method: 'GET' });
    const data = await response.json();
    alert(data.message);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Administração de Banco de Dados</h2>
      <div className="space-y-4">
        <button
          onClick={handleBackup}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Backup Database
        </button>
        <button
          onClick={handleDelete}
          className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete Database
        </button>
        <button
          onClick={handleLoad}
          className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Load Database
        </button>
      </div>
    </div>
  );
};

export default DatabaseActions;
