import { request } from "@/services/http";

export type ApplicationDto = {
  id?: string | number;
  app_id?: string | number;
  _id?: string | number;
  version?: string;
  aid_type?: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
};

export type CreateApplicationInput = {
  version: string;
  aid_type: string;
  status: string;
};

export type UpdateApplicationInput = Partial<CreateApplicationInput>;

const encode = (value: string) => encodeURIComponent(value);

export const applicationService = {
  list: (limit = 50, offset = 0) =>
    request<ApplicationDto[]>(`/application?limit=${limit}&offset=${offset}`),

  get: (id: string) => request<ApplicationDto>(`/application/${encode(id)}`),

  create: (input: CreateApplicationInput) =>
    request<ApplicationDto>("/application", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateApplicationInput) =>
    request<ApplicationDto>(`/application/${encode(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    request<unknown>(`/application/${encode(id)}`, {
      method: "DELETE",
    }),
};
