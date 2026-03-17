import { request } from "@/services/http";

export type AdminDto = {
  id?: string | number;
  admin_id?: string | number;
  _id?: string | number;
  username?: string;
  created_by?: string;
  createdAt?: string;
  created_at?: string;
};

export type CreateAdminInput = {
  username: string;
  password: string;
  created_by?: string;
};

export type UpdateAdminInput = {
  password?: string;
};

const encode = (value: string) => encodeURIComponent(value);

export const adminService = {
  list: (limit = 50, offset = 0) => request<AdminDto[]>(`/admin?limit=${limit}&offset=${offset}`),

  get: (id: string) => request<AdminDto>(`/admin/${encode(id)}`),

  getByUsername: (username: string) => request<AdminDto>(`/admin/username/${encode(username)}`),

  create: (input: CreateAdminInput) =>
    request<AdminDto>("/admin", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateAdminInput) =>
    request<AdminDto>(`/admin/${encode(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    request<unknown>(`/admin/${encode(id)}`, {
      method: "DELETE",
    }),
};
