# Alentour

Application mobile de découverte d'événements géolocalisés (Abidjan).

## Stack

| Couche | Choix | Pourquoi |
|---|---|---|
| Runtime | Expo SDK 57 / React Native 0.86 | Build et test sans Android Studio ni Xcode |
| Langage | TypeScript strict | Erreurs attrapées à la compilation |
| Navigation | Expo Router (file-based) | Même modèle mental que l'App Router de Next.js |
| Style | NativeWind 4.2 + Tailwind 3.4 | Classes Tailwind directement dans React Native |
| État serveur | TanStack Query | Cache, retry, invalidation gérés |
| Géoloc | expo-location | Permissions + position |
| Carte | react-native-maps | Marqueurs Google Maps |

## Prérequis

- Node.js 20 ou 22 (testé sur 22.22)
- L'application **Expo Go** sur ton téléphone Android

## Démarrage

```bash
npm install
npx expo start
```

Scanne le QR code avec Expo Go. Le rechargement est instantané à chaque sauvegarde.

Vérification du typage avant chaque commit :

```bash
npm run lint
```

## Points de configuration à traiter

1. **Clés Google Maps** — `app.json` contient deux placeholders
   (`REMPLACER_PAR_TA_CLE_ANDROID` / `..._IOS`). À créer sur Google Cloud
   Console, API "Maps SDK for Android". Sans clé, la carte reste grise.
2. **Build de développement** — `expo-location` fonctionne dans Expo Go.
   Si `react-native-maps` ne se charge pas dans Expo Go, il faut un build
   de développement : `npx expo run:android` (nécessite Android Studio)
   ou `eas build --profile development --platform android` (dans le cloud).
3. **API réelle** — `src/features/events/api.ts` renvoie deux événements
   en dur. C'est le seul fichier à remplacer quand le backend est prêt.

## Pièges déjà réglés

- `react-dom` est épinglé à `19.2.3` via le champ `overrides` de
  `package.json`. Sans ça, `expo-router` tire `react-dom@19.2.8` qui exige
  `react ^19.2.8`, alors que le SDK 57 fige `react` à `19.2.3` → `ERESOLVE`.
- `babel-preset-expo` est déclaré explicitement en devDependency. Le
  template blank-typescript ne l'inclut pas et Metro échoue au premier bundle.
- Reanimated 4 utilise le plugin `react-native-worklets/plugin`, pas
  l'ancien `react-native-reanimated/plugin`.

## Structure

```
app/                     routes uniquement
  _layout.tsx            providers (Query, gestures) + Stack
  (tabs)/
    _layout.tsx          barre d'onglets
    index.tsx            Autour de moi
    carte.tsx            Carte
    favoris.tsx          Favoris
  evenement/[id].tsx     fiche détail
src/
  components/            composants d'UI réutilisables
  features/events/       accès aux données événements
  lib/                   distance, position, client Query
  types/                 modèles de données
```

Règle : `app/` ne contient que des routes. Toute logique va dans `src/`.
