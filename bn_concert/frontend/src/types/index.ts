export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  newsletter: boolean;
  notifications_enabled: boolean;
  created_at: string;
}

export interface Artist {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  image_url: string | null;
  genre: string | null;
  tour_name?: string | null;
  image_gallery?: string[];
  video_gallery?: ArtistVideo[];
  facebook_url: string | null;
  instagram_url: string | null;
  spotify_url: string | null;
  x_url: string | null;
  created_at: string;
}

export interface ArtistVideo {
  id: string;
  title: string;
  collection?: string | null;
  thumbnail_url?: string | null;
  video_url?: string | null;
  views_label?: string | null;
  published_label?: string | null;
  duration_label?: string | null;
}

export interface Venue {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  capacity: number;
  image_url: string | null;
}

export interface Concert {
  id: string;
  title: string;
  date: string;
  image_url: string | null;
  min_price: number;
  max_price: number;
  status: string;
  is_featured: boolean;
  artist: Artist | null;
  venue: Venue | null;
  description?: string | null;
  doors_open?: string | null;
  show_start?: string | null;
}

export interface Section {
  id: string;
  name: string;
  color: string | null;
  price: number;
  available_count: number;
  total_count: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  label: string;
}

export interface EventSeat {
  id: string;
  concert_id: string;
  seat_id: string;
  status: 'available' | 'held' | 'sold';
  price: number;
  seat: Seat | null;
  section_name: string | null;
}

export interface OrderItem {
  id: string;
  event_seat_id: string;
  price: number;
  section_name: string | null;
  seat_label: string | null;
}

export interface OrderCustomerSnapshot {
  customer_name: string;
  customer_phone: string | null;
  customer_email: string;
  customer_address: string | null;
}

export interface Ticket {
  id: string;
  order_id: string;
  event_seat_id: string;
  qr_code: string;
  holder_name: string | null;
  is_used: boolean;
}

export interface TicketDownloadTokenResponse {
  download_token: string;
  expires_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  concert_id: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  subtotal: number;
  insurance_fee: number;
  gift_card_discount: number;
  total: number;
  payment_method: string | null;
  customer_snapshot?: OrderCustomerSnapshot | null;
  items: OrderItem[];
  tickets: Ticket[];
  created_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  author_name: string | null;
  category: string | null;
  tags: string[];
  views: number;
  created_at: string;
  published_at?: string | null;
  content?: string | null;
  comments?: Comment[];
  related_posts?: Blog[];
}

export interface Comment {
  id: string;
  author_name: string | null;
  content: string;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number;
}

export interface GiftCard {
  id: string;
  code: string;
  original_balance: number;
  current_balance: number;
  is_active: boolean;
}

export interface PaymentMethod {
  id: string;
  type: string;
  label: string;
  last_four: string | null;
  is_default: boolean;
  created_at: string;
}
