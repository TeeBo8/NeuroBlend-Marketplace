import { desc, sql, type SQL } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

/**
 * Pagination par curseur des listes, de la plus récente à la plus ancienne.
 *
 * Le curseur est l'identifiant de la première ligne de la page suivante. On
 * reprend la lecture à partir de cette ligne, au lieu de sauter N lignes avec
 * OFFSET : une ligne ajoutée entre deux pages ne décale rien, et la base
 * n'a pas à relire les pages déjà vues.
 */

type PaginatedTable = PgTable & { id: PgColumn; createdAt: PgColumn };

/**
 * Tri des listes paginées. L'identifiant départage les lignes créées au même
 * instant : sans lui, leur ordre pourrait changer d'une page à l'autre.
 */
export function newestFirst(table: PaginatedTable) {
  return [desc(table.createdAt), desc(table.id)];
}

/**
 * Condition « à partir de la ligne du curseur ». La date du curseur est relue
 * en base plutôt que transmise au navigateur : Postgres garde les
 * microsecondes, JavaScript non, et une date arrondie ferait sauter des lignes.
 *
 * Un curseur inconnu (ligne supprimée entre deux pages) donne une page vide.
 */
export function fromCursor(
  table: PaginatedTable,
  cursor: string | undefined
): SQL | undefined {
  if (!cursor) return undefined;

  return sql`(${table.createdAt}, ${table.id}) <= (
    SELECT cursor_row.created_at, cursor_row.id
    FROM ${table} AS cursor_row
    WHERE cursor_row.id = ${cursor}
  )`;
}

/**
 * Découpe le résultat d'une requête faite avec `limit + 1` : la ligne en trop
 * n'est pas renvoyée, elle indique qu'il reste une page et sert de curseur.
 */
export function toPage<T extends { id: string }>(rows: T[], limit: number) {
  return {
    items: rows.slice(0, limit),
    nextCursor: rows.length > limit ? rows[limit].id : undefined,
  };
}
