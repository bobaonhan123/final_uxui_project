import api from './client';
import { API_URL } from '../constants/config';
import type {
  TokenResponse,
  User,
  Concert,
  Artist,
  Section,
  EventSeat,
  Order,
  Blog,
  Comment,
  FAQ,
  GiftCard,
  PaymentMethod,
  Ticket,
  TicketDownloadTokenResponse,
} from '../types';

export type ConcertDateRange = 'this_week' | 'this_month' | 'next_3_months';

export interface ConcertListParams {
  skip?: number;
  limit?: number;
  search?: string;
  status?: string;
  featured?: boolean;
  artist_id?: string;
  genre?: string;
  location?: string;
  date_range?: ConcertDateRange;
}

export interface ConcertFilters {
  genres: string[];
  locations: string[];
}

export interface UserUpdatePayload {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  avatar_url?: string | null;
  newsletter?: boolean;
  notifications_enabled?: boolean;
}

export interface UserSettingsPayload {
  newsletter?: boolean;
  notifications_enabled?: boolean;
}

export type PaymentOption = 'saved_card' | 'new_card' | 'ideal';

export interface OrderCreatePayload {
  concert_id: string;
  items: { event_seat_id: string }[];
  insurance?: boolean;
  gift_card_code?: string;
  payment_method?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
}

export interface OrderPayPayload {
  payment_option: PaymentOption;
  payment_method?: string;
  saved_payment_method_id?: string;
  card_number?: string;
  card_holder_name?: string;
  card_expiry?: string;
  card_cvv?: string;
  ideal_bank?: string;
  save_new_card?: boolean;
}

// ── Auth ──
export const authApi = {
  register: (data: { email: string; password: string; first_name: string; last_name: string; phone?: string }) =>
    api.post<TokenResponse>('/auth/register', data),
  login: (email: string, password: string) =>
    api.post<TokenResponse>('/auth/login', { email, password }),
  refresh: (refresh_token: string) =>
    api.post<TokenResponse>('/auth/refresh', { refresh_token }),
  verifyEmail: (data: { token?: string; email?: string; code?: string }) =>
    api.post<{ message: string }>('/auth/verify-email', data),
  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),
  resetPassword: (data: { token?: string; email?: string; code?: string; new_password: string; confirm_password: string }) =>
    api.post<{ message: string }>('/auth/reset-password', data),
};

// ── Users ──
export const userApi = {
  getMe: () => api.get<User>('/users/me'),
  updateMe: (data: UserUpdatePayload) => api.put<User>('/users/me', data),
  updateSettings: (data: UserSettingsPayload) => api.put<User>('/users/me/settings', data),
  changePassword: (current_password: string, new_password: string, confirm_new_password: string) =>
    api.put('/users/me/password', { current_password, new_password, confirm_new_password }),
  deleteAccount: () => api.delete('/users/me'),
  getPaymentMethods: () => api.get<PaymentMethod[]>('/users/me/payment-methods'),
  addPaymentMethod: (data: { type?: string; label: string; last_four?: string; is_default?: boolean }) =>
    api.post<PaymentMethod>('/users/me/payment-methods', data),
  deletePaymentMethod: (id: string) => api.delete(`/users/me/payment-methods/${id}`),
};

// ── Concerts ──
export const concertApi = {
  list: (params?: ConcertListParams) => api.get<Concert[]>('/concerts', { params }),
  getFilters: () => api.get<ConcertFilters>('/concerts/filters'),
  get: (id: string) => api.get<Concert>(`/concerts/${id}`),
  getDates: (id: string) => api.get<Concert[]>(`/concerts/${id}/dates`),
  getSections: (id: string) => api.get<Section[]>(`/concerts/${id}/sections`),
  getSectionSeats: (concertId: string, sectionId: string) =>
    api.get<EventSeat[]>(`/concerts/${concertId}/sections/${sectionId}/seats`),
};

// ── Artists ──
export const artistApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    api.get<Artist[]>('/artists', { params }),
  get: (id: string) => api.get<Artist>(`/artists/${id}`),
  getConcerts: (id: string) => api.get<Concert[]>(`/artists/${id}/concerts`),
};

// ── Orders ──
export const orderApi = {
  create: (data: OrderCreatePayload) =>
    api.post<Order>('/orders', data),
  list: (params?: { status?: string; skip?: number; limit?: number }) =>
    api.get<Order[]>('/orders', { params }),
  get: (id: string) => api.get<Order>(`/orders/${id}`),
  pay: (id: string, data: OrderPayPayload) =>
    api.post<Order>(`/orders/${id}/pay`, data),
  cancel: (id: string) => api.post<Order>(`/orders/${id}/cancel`),
  getTickets: (id: string) => api.get<Ticket[]>(`/orders/${id}/tickets`),
  requestTicketDownloadToken: (ticketId: string) =>
    api.post<TicketDownloadTokenResponse>(`/tickets/${ticketId}/download-token`),
  getTicketDownloadUrl: (ticketId: string, downloadToken: string) =>
    `${API_URL}/tickets/${ticketId}/download?token=${encodeURIComponent(downloadToken)}`,
};

// ── Gift Cards ──
export const giftCardApi = {
  redeem: (code: string) => api.post<GiftCard>('/gift-cards/redeem', { code }),
  apply: (code: string, order_id: string) =>
    api.post<GiftCard>('/gift-cards/apply', { code, order_id }),
};

// ── Blogs ──
export const blogApi = {
  list: (params?: { skip?: number; limit?: number; category?: string; search?: string }) =>
    api.get<Blog[]>('/blogs', { params }),
  getFeatured: () => api.get<Blog>('/blogs/featured'),
  get: (slug: string) => api.get<Blog>(`/blogs/${slug}`),
  getComments: (slug: string) => api.get<Comment[]>(`/blogs/${slug}/comments`),
  addComment: (slug: string, content: string) =>
    api.post(`/blogs/${slug}/comments`, { content }),
};

// ── FAQ ──
export const faqApi = {
  list: (category?: string) => api.get<FAQ[]>('/faq', { params: category ? { category } : undefined }),
};

// ── Support ──
export const supportApi = {
  contact: (data: { name: string; email: string; subject: string; message: string }) =>
    api.post<{ message: string; reference: string; created_at: string }>('/support/contact', data),
};
