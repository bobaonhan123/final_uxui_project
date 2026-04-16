# BNConcert - Requirements Document

> Concert ticket booking mobile app — React Native (Expo) + FastAPI + SQLite/PostgreSQL

---

## 1. App Overview

BNConcert is a mobile concert ticketing platform that allows users to browse upcoming concerts, select seats from venue maps, purchase tickets with multiple payment methods, and manage their orders. The app targets the Netherlands market (USD currency) and supports features like gift cards, event insurance, e-ticket downloads, and artist/blog content.

---

## 2. User Stories

> Status legend: ✅ Done · ⏳ Partial · ☐ Not done

### 2.1 Authentication

| ID | Story | Acceptance Criteria | Status |
|----|-------|-------------------|--------|
| AUTH-01 | As a visitor, I can create an account with name, email, and password | Form validation; password strength rules; duplicate email check | ✅ |
| AUTH-02 | As a visitor, I can verify my email via a popup/code flow | Verification email sent on signup; popup confirms success | ✅ |
| AUTH-03 | As a user, I can log in with email and password | JWT token returned; redirect to Home | ✅ |
| AUTH-04 | As a user, I can log out | Token cleared; redirect to Login | ✅ |
| AUTH-05 | As a user, I can reset my password from Settings | Current password required; new password + confirm | ✅ |

### 2.2 Browse & Discover

| ID | Story | Acceptance Criteria | Status |
|----|-------|-------------------|--------|
| BRW-01 | As a user, I can scroll the Home page to see featured events, concerts, and blog posts | Long scrollable page; sections load progressively | ✅ |
| BRW-02 | As a user, I can view the All Tickets page with a grid of concert cards | 2-column grid; 8 cards per page; Load More pagination | ✅ |
| BRW-03 | As a user, I can filter concerts using filter chips | Chips for genre/date/location; results update on selection | ✅ |
| BRW-04 | As a user, I can view an Artist Page with bio, tour info, media, and social links | Artist photo, bio text, tour name, music player widget, video/image galleries, social links (FB, IG, Spotify, X) | ✅ |
| BRW-05 | As a user, I can browse blog posts and read a single blog post | Blog listing with featured banner; single post with tags, comments carousel, related posts | ✅ |
| BRW-06 | As a user, I see a 404 error page for invalid routes | Friendly error message with navigation back to Home | ✅ |

### 2.3 Buy Ticket Flow (Stepper)

| ID | Story | Acceptance Criteria | Status |
|----|-------|-------------------|--------|
| BUY-01 | As a user, I can select a date for a concert event | Date picker; only available dates shown | ✅ |
| BUY-02 | As a user, I can choose a section from a venue map | Visual venue map; sections highlighted with availability | ✅ |
| BUY-03 | As a user, I can choose specific seats from a seat grid | Row-based grid; seats color-coded (available/taken/selected); multi-select supported | ✅ |
| BUY-04 | As a user, I can confirm my selected tickets before payment | Summary: artist, venue, date, section, row, seat, price per ticket | ✅ |
| BUY-05 | As a user, I can enter/confirm my info (name, phone, address, email) | Pre-filled from profile; editable | ✅ |
| BUY-06 | As a user, I can opt into "Missed events insurance" | Checkbox toggle; adds insurance fee to total | ✅ |
| BUY-07 | As a user, I can apply a gift card code to my order | Gift card field; balance applied to order total | ✅ |
| BUY-08 | As a user, I can select a payment method (saved card, new card, iDeal) | List of saved methods; add new card form (number, name, expiry, CVV); iDeal option | ✅ |
| BUY-09 | As a user, I see a Payment Successful screen with order confirmation | Order ID, summary, e-ticket info | ✅ |
| BUY-10 | As a user, I see a Payment Failed screen with retry option | Error message; retry or change payment method | ✅ |

### 2.4 User Profile & Dashboard

| ID | Story | Acceptance Criteria | Status |
|----|-------|-------------------|--------|
| PRF-01 | As a user, I can view my Dashboard with tabs: My Profile, Order History, Gift Card, Settings, Help | Tab navigation; active tab highlighted | ✅ |
| PRF-02 | As a user, I can edit my profile (11+ fields) and change password | Fields: first name, last name, email, phone, DOB, gender, address, city, state, zip, country; save button | ✅ |
| PRF-03 | As a user, I can view Active and Past concerts in Order History | Tab toggle Active/Past; Concert History Rows with key info | ✅ |
| PRF-04 | As a user, I can view full Order History Details | Ticket info (artist, row, seats, price $200 each), customer info, e-ticket download button, payment info ($410 via iDeal) | ✅ |
| PRF-05 | As a user, I can manage gift cards (enter code, view voucher list) | Code entry field; list of applied/available vouchers with balance | ✅ |
| PRF-06 | As a user, I can toggle newsletter/notification settings | Toggle switches; persist preference | ✅ |
| PRF-07 | As a user, I can delete my account | Confirmation dialog; permanent action | ✅ |
| PRF-08 | As a user, I can access Help (FAQ accordion, email, live chat, call) | Expandable FAQ items; Contact Us with email form, call popup, live chat link | ✅ |

### 2.5 Content

| ID | Story | Acceptance Criteria | Status |
|----|-------|-------------------|--------|
| CNT-01 | As a user, I can browse blog posts with a featured banner | Featured post at top; list/grid below | ✅ |
| CNT-02 | As a user, I can read a blog post with tags and comments | Tags (#Celebrity, #TaylorSwift, #Concert); comments carousel; related posts section | ✅ |

---

## 3. Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| email | string | unique, indexed |
| password_hash | string | bcrypt |
| first_name | string | |
| last_name | string | |
| phone | string | |
| date_of_birth | date | nullable |
| gender | string | nullable |
| address | string | nullable |
| city | string | nullable |
| state | string | nullable |
| zip_code | string | nullable |
| country | string | default "Netherlands" |
| email_verified | boolean | default false |
| avatar_url | string | nullable |
| newsletter_opt_in | boolean | default false |
| notifications_enabled | boolean | default true |
| created_at | datetime | |
| updated_at | datetime | |

### Artist
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | string | e.g. "Taylor Swift" |
| bio | text | |
| photo_url | string | |
| tour_name | string | nullable, e.g. "Eras Tour" |
| facebook_url | string | nullable |
| instagram_url | string | nullable |
| spotify_url | string | nullable |
| x_url | string | nullable |
| created_at | datetime | |

### Venue
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| name | string | |
| city | string | e.g. "Delft" |
| country | string | e.g. "Netherlands" |
| address | string | |
| map_image_url | string | venue section map |

### Section
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| venue_id | UUID | FK → Venue |
| name | string | e.g. "Section A" |
| price_modifier | decimal | multiplier for base price |

### Seat
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| section_id | UUID | FK → Section |
| row | string | e.g. "A", "B" |
| seat_number | int | e.g. 1, 2, 3 |
| is_available | boolean | default true (per-event via EventSeat) |

### Concert (Event)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| artist_id | UUID | FK → Artist |
| venue_id | UUID | FK → Venue |
| title | string | |
| description | text | |
| date | datetime | |
| base_price | decimal | e.g. 200.00 USD |
| image_url | string | card thumbnail |
| status | enum | draft / published / cancelled / soldout |
| created_at | datetime | |

### EventSeat
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| concert_id | UUID | FK → Concert |
| seat_id | UUID | FK → Seat |
| status | enum | available / held / sold |
| held_until | datetime | nullable, temp hold during checkout |

### Order
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → User |
| concert_id | UUID | FK → Concert |
| status | enum | pending / paid / failed / refunded |
| subtotal | decimal | |
| insurance_fee | decimal | 0 if not selected |
| gift_card_discount | decimal | 0 if not applied |
| total | decimal | |
| payment_method | string | "visa", "mastercard", "ideal", etc. |
| payment_reference | string | external payment ID |
| customer_name | string | snapshot at order time |
| customer_phone | string | |
| customer_email | string | |
| customer_address | string | |
| created_at | datetime | |
| updated_at | datetime | |

### OrderItem
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| order_id | UUID | FK → Order |
| event_seat_id | UUID | FK → EventSeat |
| price | decimal | price at time of purchase |

### Ticket (E-Ticket)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| order_item_id | UUID | FK → OrderItem |
| qr_code | string | unique code for entry |
| pdf_url | string | downloadable e-ticket PDF |
| is_used | boolean | default false |
| created_at | datetime | |

### GiftCard
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| code | string | unique, e.g. "GC-XXXX-XXXX" |
| balance | decimal | remaining value |
| original_value | decimal | |
| user_id | UUID | FK → User, nullable (assigned on redeem) |
| is_active | boolean | default true |
| expires_at | datetime | nullable |
| created_at | datetime | |

### PaymentMethod (Saved)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → User |
| type | enum | visa / mastercard / ideal / other |
| last_four | string | e.g. "4242" |
| card_holder_name | string | |
| expiry_month | int | |
| expiry_year | int | |
| is_default | boolean | |
| created_at | datetime | |

### Blog
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| title | string | |
| slug | string | unique, URL-friendly |
| content | text | rich text / markdown |
| featured_image_url | string | |
| tags | string[] | e.g. ["Celebrity", "TaylorSwift", "Concert"] |
| is_featured | boolean | default false |
| published_at | datetime | nullable |
| created_at | datetime | |

### Comment
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| blog_id | UUID | FK → Blog |
| user_id | UUID | FK → User |
| content | text | |
| created_at | datetime | |

### FAQ
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| question | string | |
| answer | text | |
| sort_order | int | display ordering |
| is_active | boolean | default true |

---

## 4. API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/verify-email` | Verify email code |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset with token |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update profile fields |
| PUT | `/api/users/me/password` | Change password |
| PUT | `/api/users/me/settings` | Update newsletter/notifications |
| DELETE | `/api/users/me` | Delete account |
| GET | `/api/users/me/payment-methods` | List saved payment methods |
| POST | `/api/users/me/payment-methods` | Add payment method |
| DELETE | `/api/users/me/payment-methods/{id}` | Remove payment method |

### Concerts
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/concerts` | List concerts (paginated, filterable) |
| GET | `/api/concerts/featured` | Featured concerts for Home |
| GET | `/api/concerts/{id}` | Concert detail |
| GET | `/api/concerts/{id}/dates` | Available dates |
| GET | `/api/concerts/{id}/sections` | Venue sections with availability |
| GET | `/api/concerts/{id}/sections/{section_id}/seats` | Seat grid with status |

### Artists
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/artists` | List artists |
| GET | `/api/artists/{id}` | Artist detail + media |
| GET | `/api/artists/{id}/concerts` | Artist's upcoming concerts |

### Orders & Tickets
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders` | Create order (hold seats) |
| GET | `/api/orders` | List user's orders (active/past) |
| GET | `/api/orders/{id}` | Order detail |
| POST | `/api/orders/{id}/pay` | Process payment |
| GET | `/api/orders/{id}/tickets` | List e-tickets for order |
| GET | `/api/tickets/{id}/download` | Download e-ticket PDF |

### Gift Cards
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/gift-cards/redeem` | Redeem gift card code |
| GET | `/api/gift-cards` | List user's gift cards |
| POST | `/api/orders/{id}/apply-gift-card` | Apply gift card to order |

### Blog
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/blogs` | List posts (paginated) |
| GET | `/api/blogs/featured` | Featured blog post |
| GET | `/api/blogs/{slug}` | Single blog post |
| GET | `/api/blogs/{slug}/comments` | List comments |
| POST | `/api/blogs/{slug}/comments` | Add comment |

### FAQ & Support
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/faq` | List active FAQs |
| POST | `/api/support/contact` | Submit contact form (email) |

---

## 5. Screen Flow

```
Splash
  └─► Login ◄──────────────────────┐
       ├─► Create Account           │
       │    └─► Verify Email Popup  │
       │         └─► Home           │
       └─► Home (Logged In) ────────┤
            ├─► All Tickets ────────┤
            │    └─► [Buy Flow]     │
            ├─► Artist Page ────────┤
            │    └─► [Buy Flow]     │
            ├─► Blog Page           │
            │    └─► Single Blog    │
            └─► Dashboard ──────────┘
                 ├─► My Profile
                 ├─► Order History
                 │    └─► Order History Details
                 │         └─► Download E-Ticket
                 ├─► Gift Card
                 ├─► Settings
                 │    ├─► Change Password
                 │    └─► Delete Account
                 └─► Help
                      ├─► FAQ (accordion)
                      └─► Contact Us (email/call/chat)

[Buy Ticket Flow - Stepper]
  Step 1: Select Date
  Step 2: Choose Section (venue map)
  Step 3: Choose Seat (seat grid)
  Step 4: Confirm Tickets
  Step 5: Overview & Payment
           ├─► User info
           ├─► Insurance option
           ├─► Gift card option
           ├─► Payment method selection
           └─► Card info form
  Result:  Payment Successful ─► Order History
           Payment Failed ─► Retry / Change Method

[Bottom Tab Navigation]
  Home | Tickets | (Search) | Blog | Profile
```

### Navigation Structure (React Navigation)
- **Stack Navigator** (root): Splash → Auth Stack / Main Tabs
- **Auth Stack**: Login, Register, VerifyEmail
- **Main Tab Navigator**: Home, AllTickets, Search, Blog, Dashboard
- **Dashboard Stack**: Dashboard, MyProfile, OrderHistory, OrderDetail, GiftCard, Settings, Help, ContactUs
- **Buy Ticket Stack** (modal): SelectDate → ChooseSection → ChooseSeat → ConfirmTickets → OverviewPayment → PaymentResult

---

## 6. Business Rules

### Authentication
- Email must be verified before first purchase
- JWT access token: 30 min; refresh token: 7 days
- Password: minimum 8 chars, 1 uppercase, 1 number

### Seat Selection & Holds
- Seats are held for **10 minutes** during checkout (EventSeat.held_until)
- Expired holds auto-release seats back to available
- Maximum **6 tickets** per order per user
- Seat status transitions: `available → held → sold` or `held → available` (on timeout/cancel)

### Pricing & Payment
- Currency: **USD ($)**
- Ticket price = `Concert.base_price × Section.price_modifier`
- Insurance fee: flat rate added to order total (optional)
- Gift card: partial or full balance applied; remainder stays on card
- Supported payment methods: Visa, Mastercard, iDeal
- Order total = `subtotal + insurance_fee - gift_card_discount`
- Payment must complete within hold window (10 min)

### Orders & Tickets
- E-tickets generated only after successful payment
- Each OrderItem produces exactly 1 Ticket with unique QR code
- E-ticket PDF downloadable from Order History Details
- Order statuses: `pending → paid → refunded` or `pending → failed`
- Past orders = concerts where `Concert.date < now`
- Active orders = concerts where `Concert.date >= now`

### Gift Cards
- Codes: format `GC-XXXX-XXXX`, case-insensitive
- One gift card per order
- Cannot exceed order total (no cash-back)
- Gift cards may have expiry dates

### Content
- Blog posts support tags for categorization
- Only one blog can be featured at a time
- Comments require authenticated user
- FAQ items ordered by `sort_order`

### Account
- Account deletion is permanent; confirmation required
- Profile updates do not require re-authentication (except password)
- Newsletter/notification preferences are independent toggles

### Pagination
- Concert list: 8 items per page, "Load More" button
- Blog list: standard pagination
- Order history: infinite scroll or Load More
