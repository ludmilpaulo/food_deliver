import axios from 'axios';
import { baseAPI } from './types';
import { User } from './adminTypes';


const API_URL = baseAPI;

export const getUsers = async (): Promise<User[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getUser = async (id: number): Promise<User> => {
  const response = await axios.get(`${API_URL}/${id}/`);
  return response.data;
};

export const createUser = async (user: User): Promise<User> => {
  const response = await axios.post(API_URL, user);
  return response.data;
};

export const updateUser = async (id: number, user: User): Promise<User> => {
  const response = await axios.put(`${API_URL}/${id}/`, user);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}/`);
};
