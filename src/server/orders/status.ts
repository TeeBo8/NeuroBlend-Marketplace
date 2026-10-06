import { inArray, ne } from 'drizzle-orm';
import { orders } from '@/server/db/schema';

/**
 * Statuts d'une commande dont le paiement est encaissé. Une commande reste
 * dans le chiffre d'affaires quand elle avance de « payée » à « livrée » ;
 * elle n'en sort que si elle est annulée.
 */
export const COLLECTED_STATUSES = [
  'paid',
  'processing',
  'shipped',
  'delivered',
] as const;

/** Condition SQL : la commande compte dans le chiffre d'affaires. */
export const isCollected = inArray(orders.status, [...COLLECTED_STATUSES]);

/**
 * Condition SQL : la commande existe pour de bon. « En attente » veut dire que
 * le client est sur la page de paiement, ou qu'il l'a quittée : ce n'est pas
 * encore une commande.
 */
export const isPlaced = ne(orders.status, 'pending');

/**
 * Statuts depuis lesquels un vendeur peut faire passer une commande au statut
 * donné. Une commande n'avance que dans un sens, et seulement une fois payée.
 */
export const STATUSES_BEFORE = {
  processing: ['paid'],
  shipped: ['paid', 'processing'],
  delivered: ['shipped'],
} as const;
