import { describe, it, expect } from "vitest";
import { serializeJsonLd } from "@/components/seo/json-ld";

// Séparateurs de ligne et de paragraphe : valides en JSON, mais coupent un script.
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

describe("serializeJsonLd", () => {
  it("ne laisse pas un texte utilisateur fermer la balise script", () => {
    const html = serializeJsonLd({
      review: { reviewBody: "</script><script>alert(1)</script>" },
    });

    expect(html).not.toContain("</script>");
    expect(html).not.toContain("<");
  });

  it("neutralise aussi les commentaires HTML et les séparateurs de ligne", () => {
    const html = serializeJsonLd({ name: `<!-- ${LS} ${PS} & >` });

    for (const char of ["<", ">", "&", LS, PS]) {
      expect(html).not.toContain(char);
    }
  });

  it("reste du JSON valide qui redonne les données d'origine", () => {
    const data = {
      "@type": "Product",
      name: `Café <b>Crème</b> & co ${LS}`,
      offers: { price: 12.9 },
    };

    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
