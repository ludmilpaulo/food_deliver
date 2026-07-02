import api from './api';
import { isPlatformAdminUser } from '@/utils/postLoginRoute';
import type {
  AboutUsRecord,
  AuthMeResponse,
  CmsWritePayload,
  ContactRecord,
  MarketplaceCustomerRow,
  TeamRecord,
  User,
  WhyChooseUsRecord,
} from './adminTypes';

const INFO_PREFIX = '/info';

export const fetchAboutUs = async (): Promise<AboutUsRecord[]> => {
  const response = await api.get<AboutUsRecord[]>(`${INFO_PREFIX}/aboutus/`);
  return response.data;
};

export const createAboutUs = async (data: CmsWritePayload): Promise<AboutUsRecord> => {
  const response = await api.post<AboutUsRecord>(`${INFO_PREFIX}/aboutus/`, data);
  return response.data;
};

export const updateAboutUs = async (id: number, data: CmsWritePayload): Promise<AboutUsRecord> => {
  const response = await api.put<AboutUsRecord>(`${INFO_PREFIX}/aboutus/${id}/`, data);
  return response.data;
};

export const deleteAboutUs = async (id: number): Promise<void> => {
  await api.delete(`${INFO_PREFIX}/aboutus/${id}/`);
};

export const fetchWhyChooseUs = async (): Promise<WhyChooseUsRecord[]> => {
  const response = await api.get<WhyChooseUsRecord[]>(`${INFO_PREFIX}/whychooseus/`);
  return response.data;
};

export const createWhyChooseUs = async (data: CmsWritePayload): Promise<WhyChooseUsRecord> => {
  const response = await api.post<WhyChooseUsRecord>(`${INFO_PREFIX}/whychooseus/`, data);
  return response.data;
};

export const updateWhyChooseUs = async (
  id: number,
  data: CmsWritePayload,
): Promise<WhyChooseUsRecord> => {
  const response = await api.put<WhyChooseUsRecord>(`${INFO_PREFIX}/whychooseus/${id}/`, data);
  return response.data;
};

export const deleteWhyChooseUs = async (id: number): Promise<void> => {
  await api.delete(`${INFO_PREFIX}/whychooseus/${id}/`);
};

export const fetchTeams = async (): Promise<TeamRecord[]> => {
  const response = await api.get<TeamRecord[]>(`${INFO_PREFIX}/teams/`);
  return response.data;
};

export const createTeam = async (data: CmsWritePayload): Promise<TeamRecord> => {
  const response = await api.post<TeamRecord>(`${INFO_PREFIX}/teams/`, data);
  return response.data;
};

export const updateTeam = async (id: number, data: CmsWritePayload): Promise<TeamRecord> => {
  const response = await api.put<TeamRecord>(`${INFO_PREFIX}/teams/${id}/`, data);
  return response.data;
};

export const deleteTeam = async (id: number): Promise<void> => {
  await api.delete(`${INFO_PREFIX}/teams/${id}/`);
};

export const fetchContacts = async (): Promise<ContactRecord[]> => {
  const response = await api.get<ContactRecord[]>(`${INFO_PREFIX}/contacts/`);
  return response.data;
};

export const createContact = async (data: CmsWritePayload): Promise<ContactRecord> => {
  const response = await api.post<ContactRecord>(`${INFO_PREFIX}/contacts/`, data);
  return response.data;
};

export const updateContact = async (id: number, data: CmsWritePayload): Promise<ContactRecord> => {
  const response = await api.put<ContactRecord>(`${INFO_PREFIX}/contacts/${id}/`, data);
  return response.data;
};

export const deleteContact = async (id: number): Promise<void> => {
  await api.delete(`${INFO_PREFIX}/contacts/${id}/`);
};

/** Uses `/api/auth/me/` — legacy `/users/:id/` does not exist on the API. */
export const checkAdmin = async (_userId: number): Promise<boolean> => {
  const { data } = await api.get<AuthMeResponse>('/api/auth/me/');
  return isPlatformAdminUser({
    role: data.role,
    is_platform_admin: data.is_platform_admin,
  });
};

function mapCustomerToUser(row: MarketplaceCustomerRow): User {
  const parts = row.name.trim().split(/\s+/);
  const first_name = parts[0] ?? row.name;
  const last_name = parts.slice(1).join(' ');
  return {
    id: row.id,
    username: row.name,
    email: row.phone,
    first_name,
    last_name,
    is_customer: true,
    is_driver: false,
  };
}

/** Marketplace customers from the platform admin API (replaces broken root GET). */
export const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get<MarketplaceCustomerRow[]>(
    '/api/v1/admin/marketplace/customers/',
  );
  return data.map(mapCustomerToUser);
};

export const getUser = async (id: number): Promise<User> => {
  const users = await getUsers();
  const match = users.find((user) => user.id === id);
  if (!match) {
    throw new Error(`Customer ${id} not found`);
  }
  return match;
};

export const createUser = async (_user: User): Promise<User> => {
  throw new Error('User creation is not supported via this legacy admin screen.');
};

export const updateUser = async (_id: number, _user: User): Promise<User> => {
  throw new Error('User updates are not supported via this legacy admin screen.');
};

export const deleteUser = async (_id: number): Promise<void> => {
  throw new Error('User deletion is not supported via this legacy admin screen.');
};

export const fetchResources = async (resource: string): Promise<unknown> => {
  const response = await api.get(`/${resource}/`);
  return response.data;
};

export const createResource = async (
  resource: string,
  data: CmsWritePayload,
): Promise<unknown> => {
  const response = await api.post(`/${resource}/`, data);
  return response.data;
};

export const updateResource = async (
  resource: string,
  id: number,
  data: CmsWritePayload,
): Promise<unknown> => {
  const response = await api.put(`/${resource}/${id}/`, data);
  return response.data;
};

export const deleteResource = async (resource: string, id: number): Promise<void> => {
  await api.delete(`/${resource}/${id}/`);
};
