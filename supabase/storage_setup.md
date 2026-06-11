# Supabase Storage Setup Guide

To store high-quality portfolio images and video reels, you need to set up a **Storage Bucket** in your Supabase dashboard. Follow these steps:

---

## Step 1: Create the `media` Bucket

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click on the **Storage** icon in the left sidebar (it looks like a bucket/cylinder).
3. Click on the **New Bucket** button.
4. Name the bucket: `media`
5. **Toggle ON "Public Bucket"** (this is important, as it allows anyone visiting your website to view the images/videos).
6. Click **Save**.

---

## Step 2: Configure Storage Policies (Security)

By default, even public buckets require security policies to determine who is allowed to upload, edit, or delete files. We want to configure it so **only you** (the logged-in admin) can change files, but **everyone** can view them.

### Policy 1: Allow Public to View Files (Read Access)
1. In the Storage section, click on **Policies** in the left sub-menu.
2. Find the column for `media` bucket under **Bucket Policies**.
3. Under the **media** bucket section, click **New Policy** -> select **Create a policy from scratch**.
4. Set the following options:
   - **Policy Name**: `Allow public read access`
   - **Allowed operations**: Check only `SELECT` (Read).
   - **Target roles**: Leave as default or select `public`.
   - **Policy definition**: Enter `true` in the input field.
5. Click **Review** -> Click **Save policy**.

### Policy 2: Allow Admin to Upload & Manage Files (Write Access)
1. Click **New Policy** again under the `media` bucket section -> select **Create a policy from scratch**.
2. Set the following options:
   - **Policy Name**: `Allow admin full access`
   - **Allowed operations**: Check `INSERT`, `UPDATE`, and `DELETE`.
   - **Target roles**: Select `authenticated` (this represents users logged in via your admin dashboard).
   - **Policy definition**: Enter the following condition:
     ```sql
     (role() = 'authenticated'::text)
     ```
3. Click **Review** -> Click **Save policy**.

---

## Your Supabase Setup is Complete!
Once you've run the SQL schema in the SQL Editor and configured this Storage bucket, your database back-end is 100% ready to interface with the Next.js front-end.
