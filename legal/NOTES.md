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

Voir la réponse de la conversation au moment de l'étape 3 pour l'évaluation
complète (Vercel vs alternatives). Résumé : deux pages statiques sur le
Vercel existant (portfolio) est la voie retenue.
