# Notes internes — à ne jamais publier

Ce fichier rassemble tout ce qui concerne l'éditeur mais n'a rien à faire
dans les documents publics (`politique-confidentialite.md`,
`mentions-legales.md`). Il reste dans ce dossier, jamais exposé côté app ni
derrière l'URL publique — voir étape 3 pour la séparation contenu
public/interne.

## Informations manquantes dans les documents publics

Chercher `À COMPLÉTER` dans les deux fichiers. Récapitulatif :

- Identité de l'éditeur (raison sociale ou nom, forme juridique, adresse,
  RCCM le cas échéant) — `mentions-legales.md` §1, `politique-confidentialite.md` §1
- Directeur de la publication — `mentions-legales.md` §1
- Hébergeur de l'API + adresse — `mentions-legales.md` §2
- Adresse email de contact (répétée dans les deux documents)
- Date de dernière mise à jour (les deux documents)

## Cadre légal (politique de confidentialité, §2)

Le document pose la loi ivoirienne n°2013-450 du 19 juin 2013 (protection
des données à caractère personnel) et le contrôle de l'ARTCI comme cadre
applicable. Décision actée : gardé tel quel, **à faire relire par un
juriste avant toute publication réelle** — en particulier si l'app vise
aussi des utilisateurs hors de Côte d'Ivoire, auquel cas d'autres cadres
(RGPD si utilisateurs UE, etc.) pourraient s'appliquer en plus.

## Suppression de compte (politique de confidentialité, §8)

Aucun bouton "supprimer mon compte" n'existe dans l'application — chaque
demande reçue à l'adresse de contact est un traitement manuel.

**Pourquoi une suppression pure est impossible** : la base de données
interdit explicitement de supprimer un utilisateur tant qu'il a des
événements ou réservations liés (`onDelete: Restrict` sur ces relations
dans `alentour-api/prisma/schema.prisma`) — une contrainte volontaire, pour
ne jamais casser l'historique d'autres utilisateurs (ex. un participant qui
a réservé chez un organisateur supprimé).

**Ce que "supprimer" veut dire en pratique** : anonymiser la ligne
(remplacer nom/email/téléphone par des valeurs neutres, invalider le mot
de passe) en conservant l'identifiant technique (`id`) intact, pour que les
événements/réservations liés restent cohérents.

**Comment le faire** : script `alentour-api/scripts/anonymiser-utilisateur.ts`,
écrit et documenté, jamais exécuté automatiquement. Voir l'en-tête du
script pour l'usage exact. Résumé :

```bash
cd alentour-api
npx ts-node scripts/anonymiser-utilisateur.ts +2250700000000
```

Prend un numéro de téléphone OU un email en argument, affiche l'utilisateur
trouvé et demande une confirmation explicite avant d'écrire quoi que ce
soit.

**Délai de traitement à committer dans le document public** : la section 8
ne promet actuellement aucun délai chiffré. 30 jours est un usage courant
(RGPD notamment) — à fixer une fois que tu sais combien de temps
l'opération manuelle (identifier le compte + lancer le script) te prend
réellement en pratique.

## Mineurs (politique de confidentialité, §9)

Fait, pas une politique : l'inscription ne vérifie aucun âge aujourd'hui.
Si un âge minimum doit être imposé, il faut soit l'ajouter comme validation
au formulaire d'inscription (mobile + API), soit assumer que c'est une
condition d'utilisation non vérifiée techniquement — la politique ne peut
pas prétendre le contraire sans que ce soit faux.

## Étape 3 — accessibilité publique

**Dans l'app** : entrées "Politique de confidentialité" / "Mentions
légales" dans l'onglet Profil (`app/(tabs)/profil.tsx`), visibles avec ou
sans connexion. Elles ouvrent une URL externe (`Linking.openURL`, pas de
rendu markdown natif — évite une dépendance et une duplication de contenu
entre l'app et la page publique). URLs placeholder dans `src/lib/legal.ts`,
à remplacer une fois le déploiement fait.

**Évaluation hébergement — deux options viables :**

1. **Réutiliser le projet Vercel du portfolio**, deux nouvelles pages
   (`/politique-confidentialite`, `/mentions-legales`). Le plus rapide :
   zéro nouveau compte, zéro nouveau projet, tu sais déjà déployer dessus.
   Inconvénient réel : le couple à la durée de vie d'un projet personnel —
   si le portfolio est un jour refondu, renommé ou dépublié, l'URL exigée
   par le Play Store casse (récupérable en mettant à jour la fiche store,
   mais un aller-retour évitable).

2. **Un second projet Vercel dédié à Alentour** (recommandé) — deux
   fichiers HTML statiques, `vercel.json` minimal, aucun framework requis.
   Même compte, même gratuité, ~10 minutes de plus que l'option 1, mais
   découplé du portfolio : renommer/retirer le portfolio n'affecte jamais
   les pages légales. Donne une URL type
   `alentour-legal.vercel.app/politique-confidentialite` — pointable plus
   tard sur un vrai domaine (`alentour.ci` ou autre) sans rien changer côté
   app, juste la config DNS du projet Vercel.

Décision : à confirmer par l'utilisateur. Dans les deux cas, il faut
convertir `legal/politique-confidentialite.md` et `legal/mentions-legales.md`
en HTML servable (fichiers `.html` statiques si pas de framework ; pages
si le portfolio utilise Next.js/Astro/etc. — a verifier selon la stack
reelle du portfolio). Pas de pipeline de synchronisation automatique entre
les `.md` sources et la page publiée : mise à jour manuelle a chaque
changement de contenu, deliberement, pour ne pas construire une
infrastructure de publication pour deux pages statiques.

Une fois les vraies URLs connues : mettre à jour
`src/lib/legal.ts` (URL_POLITIQUE_CONFIDENTIALITE, URL_MENTIONS_LEGALES)
et la fiche Play Store (champ "Politique de confidentialité", obligatoire
a la soumission).
