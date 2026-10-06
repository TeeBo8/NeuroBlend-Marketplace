import Stripe from 'stripe';
import { isDemo } from '@/lib/demo';

export const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  // La démo est ouverte à tous : elle ne doit jamais encaisser d'argent réel.
  if (isDemo && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    throw new Error('En mode démo, STRIPE_SECRET_KEY doit être une clé de test');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
  });
};
