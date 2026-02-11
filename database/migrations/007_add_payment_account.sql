-- Migration: Add payment account number to orders table
-- This migration adds support for payment account information

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS order_payment_account CHARACTER VARYING NOT NULL DEFAULT '';
