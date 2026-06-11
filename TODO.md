# Tripti Maakan Portfolio - Future Tasks & Enhancements

This document tracks planned improvements, technical upgrades, and feature expansions for the modeling portfolio.

---

## 1. Performance & Media Optimizations
- [ ] **Dynamic WebP Conversion**: Set up automatic image compression/transformation (e.g., using Supabase Storage image transformation options or Next.js custom loaders) to serve responsive WebP formats instead of large raw JPG/PNG assets.
- [ ] **Video Lazy Loading**: Implement visual placeholders or lazy loading for videos on `/videos` to decrease initial page weight and network overhead.
- [ ] **Asset Preloading**: Preload the home hero background image to improve Largest Contentful Paint (LCP) performance metrics.

---

## 2. Admin Panel Enhancements
- [ ] **Drag-and-Drop Reordering**: Integrate a drag-and-drop library (e.g., `dnd-kit` or `react-beautiful-dnd`) in the Gallery and Video managers to dynamically update the `order_index` of items in the database.
- [ ] **Rich-Text Markdown Editor**: Implement a WYSIWYG markdown editor (e.g., `SimpleMDE` or `md-editor-rt`) in the Journal Manager to simplify drafting and formatting posts.
- [ ] **Inbox Pagination & Search**: Add search, categorization filter tabs, and page limits to the admin incoming messages panel.

---

## 3. SEO, Metadata & Analytics
- [ ] **Open Graph (OG) Tags**: Generate dynamic Open Graph tags for journal articles so that sharing links on platforms like LinkedIn, Instagram, or Twitter displays custom cover images, titles, and excerpts.
- [ ] **Sitemap & Robots Generator**: Create a dynamic `sitemap.xml` and `robots.txt` output based on published journal slugs for optimal crawler indexing.
- [ ] **Web Analytics Integration**: Add lightweight tracking scripts (e.g., Vercel Analytics or Google Analytics) to monitor casting inquiry conversions and visitor locations.

---

## 4. UX & Lightbox Features
- [ ] **Mobile Touch Gestures**: Integrate pinch-to-zoom and swipe-to-dismiss gestures in the gallery lightbox preview slider for improved mobile navigation.
- [ ] **Dark Mode / Light Mode toggle**: Although the current black/gold theme is the brand default, a subtle contrast toggle can improve readability.
- [ ] **Interactive Metrics Card**: Allow clicking on measurements to toggle between Metric (CM) and Imperial (Inches) formats.

---

## 5. Security Hardening
- [ ] **Rate Limiting**: Set up rate limiting on contact form submissions (`/contact`) to prevent spam queries.
- [ ] **Supabase MFA**: Enable Multi-Factor Authentication (MFA) in the Supabase Dashboard for the administrator login account.
