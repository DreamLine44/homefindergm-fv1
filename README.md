# HomeFinderGM Frontend

A full-featured real estate listing platform built with React + Vite + Tailwind CSS.

## Tech Stack
- **React 18** + **Vite 5**
- **React Router v6** — file-based routing with nested routes
- **Tailwind CSS v3** — utility-first styling
- **Axios** — API communication with interceptors
- **DM Sans** + **Playfair Display** — custom typography

## Features

### Public
- Homepage with hero, stats, featured listings
- Listings page with filters (type, city, price, sort)
- Property details with image gallery
- Comments with nested replies and likes
- Search results page
- About, Contact, Help pages

### User Dashboard
- Dashboard overview with stats + recent listings
- Full profile management + avatar upload (Cloudinary)
- Create / edit / delete property listings
- Image upload (up to 5 per post)
- Saved properties (UI)
- Messaging (UI)

### Admin Panel
- Report overview dashboard
- Reports table with filter by status
- Report detail with status management
- Delete reports

## Getting Started

```bash
npm install
npm run dev
```

Configure your backend URL in `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Then update `src/utils/constants.js`:
```js
export const BASE_URL = import.meta.env.VITE_API_URL;
```

## Folder Structure

```
src/
├── api/          # Axios instance + API modules
├── auth/         # AuthContext (login, logout, user state)
├── components/   # Reusable components
│   ├── common/   # Button, Input, Badge, Modal, Loader...
│   ├── posts/    # PostCard, PostGrid, PostForm, ImageGallery
│   ├── comments/ # CommentItem, CommentList
│   ├── profile/  # ProfileCard, AvatarUpload
│   └── admin/    # ReportTable
├── layouts/      # MainLayout, AuthLayout, DashboardLayout, AdminLayout
├── pages/        # All page components
│   ├── public/
│   ├── auth/
│   ├── dashboard/
│   └── admin/
├── routes/       # AppRouter + route guards
└── utils/        # helpers.js, constants.js
```

## Route Map

| Path | Access | Page |
|------|--------|------|
| `/` | Public | Home |
| `/properties` | Public | Listings |
| `/properties/:id` | Public | Property Details |
| `/search` | Public | Search |
| `/login` | Guest only | Login |
| `/register` | Guest only | Register |
| `/dashboard` | Auth | Dashboard Home |
| `/dashboard/profile` | Auth | Profile |
| `/dashboard/posts` | Auth | My Listings |
| `/dashboard/posts/create` | Auth | Create Listing |
| `/dashboard/posts/:id/edit` | Auth | Edit Listing |
| `/admin` | Admin only | Admin Dashboard |
| `/admin/reports` | Admin only | Reports |
| `/admin/reports/:id` | Admin only | Report Details |
