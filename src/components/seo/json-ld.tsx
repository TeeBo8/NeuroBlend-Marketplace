// Séparateurs de ligne et de paragraphe : valides en JSON, mais coupent un script.
const LINE_SEPARATORS = String.fromCharCode(0x2028, 0x2029);

const UNSAFE_CHARS = new RegExp(`[<>&${LINE_SEPARATORS}]`, "g");

const toUnicodeEscape = (char: string) =>
  "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0");

// Les données contiennent du texte saisi par les utilisateurs (avis, noms de
// produits). Sans échappement, un "</script>" dans un avis fermerait la balise
// et exécuterait du code chez chaque visiteur. Le JSON obtenu reste identique
// une fois lu.
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(UNSAFE_CHARS, toUnicodeEscape);
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
