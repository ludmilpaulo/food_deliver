// Careers.tsx
"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Career } from '@/services/types';

const Careers = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [newCareer, setNewCareer] = useState<Omit<Career, 'id'>>({ title: '', description: '' });
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    const response = await axios.get<Career[]>('/api/careers/');
    setCareers(response.data);
  };

  const handleCreate = async () => {
    await axios.post('/api/careers/', newCareer);
    setNewCareer({ title: '', description: '' });
    fetchCareers();
  };

  const handleUpdate = async (career: Career) => {
    await axios.put(`/api/careers/${career.id}/`, career);
    setEditingCareer(null);
    fetchCareers();
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`/api/careers/${id}/`);
    fetchCareers();
  };

  return (
    <div>
      <h2>Careers</h2>
      <div>
        <input
          type="text"
          value={newCareer.title}
          onChange={(e) => setNewCareer({ ...newCareer, title: e.target.value })}
          placeholder="Title"
        />
        <textarea
          value={newCareer.description}
          onChange={(e) => setNewCareer({ ...newCareer, description: e.target.value })}
          placeholder="Description"
        />
        <button onClick={handleCreate}>Create Career</button>
      </div>
      <ul>
        {careers.map((career) => (
          <li key={career.id}>
            {editingCareer?.id === career.id ? (
              <div>
                <input
                  type="text"
                  value={editingCareer.title}
                  onChange={(e) => setEditingCareer({ ...editingCareer, title: e.target.value })}
                  placeholder="Title"
                />
                <textarea
                  value={editingCareer.description}
                  onChange={(e) => setEditingCareer({ ...editingCareer, description: e.target.value })}
                  placeholder="Description"
                />
                <button onClick={() => handleUpdate(editingCareer)}>Save</button>
                <button onClick={() => setEditingCareer(null)}>Cancel</button>
              </div>
            ) : (
              <div>
                <h3>{career.title}</h3>
                <p>{career.description}</p>
                <button onClick={() => setEditingCareer(career)}>Edit</button>
                <button onClick={() => handleDelete(career.id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Careers;
