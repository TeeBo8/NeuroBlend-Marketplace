/**
 * Couleur de la pastille d'un statut de commande, la même sur tous les
 * écrans. Fond translucide et texte adapté au thème : lisible en clair comme
 * en sombre.
 */
export const ORDER_STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
  paid: 'bg-green-500/15 text-green-700 dark:text-green-300',
  processing: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  shipped: 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
  delivered: 'bg-green-500/15 text-green-700 dark:text-green-300',
  cancelled: 'bg-red-500/15 text-red-700 dark:text-red-300',
};
