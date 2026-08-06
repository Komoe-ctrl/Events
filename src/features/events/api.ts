import type { Evenement } from "@/types/event";

const DONNEES_TEST: Evenement[] = [
  {
    id: "1",
    titre: "Nuit du Coupé-Décalé",
    description: "Une nuit entière dédiée aux classiques du coupé-décalé.",
    image: "https://placehold.co/800x500/F26A21/FFFFFF/png?text=Concert",
    categorie: "concert",
    dateDebut: "2026-08-15T21:00:00+00:00",
    dateFin: "2026-08-16T04:00:00+00:00",
    prix: 10000,
    latitude: 5.3167,
    longitude: -4.0333,
    adresse: "Palais de la Culture",
    commune: "Treichville",
    contactOrganisateur: "+2250700000000",
  },
  {
    id: "2",
    titre: "Meetup Devs Abidjan",
    description: "Rencontre mensuelle des développeurs de la ville.",
    image: "https://placehold.co/800x500/14110F/FFFFFF/png?text=Meetup",
    categorie: "conference",
    dateDebut: "2026-08-12T17:30:00+00:00",
    dateFin: null,
    prix: null,
    latitude: 5.3599,
    longitude: -3.9962,
    adresse: "Cocody, II Plateaux",
    commune: "Cocody",
    contactOrganisateur: "+2250700000001",
  },
];

export async function recupererEvenements(): Promise<Evenement[]> {
  await new Promise((r) => setTimeout(r, 300));
  return DONNEES_TEST;
}

export async function recupererEvenement(id: string): Promise<Evenement | null> {
  const tous = await recupererEvenements();
  return tous.find((e) => e.id === id) ?? null;
}
