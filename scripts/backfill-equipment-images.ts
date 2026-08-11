/**
 * Recherche une photo réelle (web) pour chaque équipement qui n'en a pas encore,
 * et l'enregistre dans Equipment.imageUrl. Utilise la même recherche DuckDuckGo
 * que la création d'équipement (app/api/equipment/route.ts) pour rester cohérent :
 * un admin qui ajoute un équipement obtient déjà une photo automatiquement,
 * ce script comble juste le retard pour les équipements existants.
 */
import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function searchProductImage(query: string): Promise<string | null> {
  try {
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
    const htmlRes = await fetch(searchUrl, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(8000),
    });
    const html = await htmlRes.text();

    const vqdMatch = html.match(/vqd=["']([^"']+)["']/);
    if (!vqdMatch) return null;
    const vqd = vqdMatch[1];

    const imgUrl = `https://duckduckgo.com/i.js?l=wt-wt&o=json&q=${encodeURIComponent(query)}&vqd=${encodeURIComponent(vqd)}&f=,,,&p=1`;
    const imgRes = await fetch(imgUrl, {
      headers: { "User-Agent": UA, "Referer": "https://duckduckgo.com/" },
      signal: AbortSignal.timeout(8000),
    });
    const data = await imgRes.json();

    return data.results?.[0]?.image ?? null;
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  const items = await prisma.equipment.findMany({
    where: { imageUrl: null },
    orderBy: { internalId: "asc" },
  });

  console.log(`${items.length} équipement(s) sans photo à traiter...`);

  let ok = 0, fail = 0;
  for (const item of items) {
    const query = [item.name, item.brand, item.model].filter(Boolean).join(" ");
    const imageUrl = await searchProductImage(query);

    if (imageUrl) {
      await prisma.equipment.update({ where: { id: item.id }, data: { imageUrl } });
      ok++;
      console.log(`✅ ${item.name} → ${imageUrl}`);
    } else {
      fail++;
      console.log(`⚠️  ${item.name} → aucune image trouvée`);
    }

    // Petite pause pour rester correct avec DuckDuckGo
    await sleep(600);
  }

  console.log(`\nTerminé : ${ok} photo(s) trouvée(s), ${fail} sans résultat.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
