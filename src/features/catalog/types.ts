export type CatalogSourceType = "SHOW" | "MOVIE";

/** Item de `GET /catalog/search` — vem do Ticketmaster (SHOW) ou do TMDb
 * (MOVIE). `date`, `imageUrl` e `description` podem faltar na origem. */
export interface CatalogItem {
  externalId: string;
  title: string;
  sourceType: CatalogSourceType;
  date: string | null;
  imageUrl: string | null;
  description: string | null;
  provider: string;
}

export interface CatalogSearchResponse {
  items: CatalogItem[];
}
