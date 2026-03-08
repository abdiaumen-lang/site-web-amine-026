-- Script to add Telegram Bot and Chat ID fields to the website_settings table.
-- Please run this script in your Supabase SQL Editor.

ALTER TABLE public.website_settings
ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT NULL,
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT NULL;
