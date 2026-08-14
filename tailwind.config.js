/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Orange taxi d'Abidjan — plus saturé que l'ancien brand-500, assumé
        // comme couleur "affiche" plutôt qu'adouci pour un usage SaaS.
        brand: {
          50: "#FFF1E6",
          100: "#FFD9B8",
          500: "#FF6B00",
          600: "#E85D00",
          700: "#B84800",
        },
        // Jaune signal — reserve aux accents ponctuels (prix, badges), jamais
        // en fond de grande surface : deux couleurs vives en meme temps
        // neutralisent l'effet poster au lieu de le renforcer.
        accent: {
          DEFAULT: "#FFC400",
          ink: "#3D2B00", // texte sur fond accent (chips), pas ink.DEFAULT
        },
        ink: {
          DEFAULT: "#1A1410",
          muted: "#5C5248",
          // #948A7E ne passait pas 4.5:1 sur surface-sunken (3.16:1 mesure) —
          // assombri pour rester lisible en plein soleil. C'est la cause du
          // texte "ocre clair" repere sur l'onglet Carte (tabBarInactiveTintColor)
          // et le placeholder des champs de formulaire.
          faint: "#6B6560",
        },
        // Papier chaud, pas blanc pur : evite le "carte produit" generique.
        surface: {
          DEFAULT: "#FBF6F0",
          sunken: "#F2EAE0",
        },
        // Reserve aux separateurs fonctionnels (formulaires, listes admin) —
        // les cartes evenement de la direction 1 ne s'appuient pas sur une
        // bordure grise pour se decouper, mais sur l'aplat de couleur.
        line: "#E8DDCE",
      },
      fontFamily: {
        // Titres d'evenements : display condense tres epais, effet affiche
        // collee. Bascule silencieusement sur la police systeme tant que la
        // police n'est pas chargee (voir explication ci-dessous) — ce token
        // est donc sans risque a ajouter des maintenant.
        display: ["Anton_400Regular", "System"],
      },
      fontSize: {
        // Echelle additive : les tailles Tailwind existantes (text-sm,
        // text-base, text-xs...) restent utilisees pour le corps de texte.
        // Ces quatre tailles sont reservees aux titres et etiquettes qui
        // portent le caractere "affiche" de la direction 1.
        "display-lg": ["34px", { lineHeight: "36px", letterSpacing: "0.3px" }], // titre plein ecran (fiche evenement)
        display: ["24px", { lineHeight: "26px", letterSpacing: "0.2px" }], // titre de carte, titre d'ecran
        "display-sm": ["18px", { lineHeight: "20px", letterSpacing: "0.2px" }], // sous-titre, en-tete de section
        label: ["11px", { lineHeight: "14px", letterSpacing: "1px" }], // etiquette majuscule type "CONCERT", chip categorie/prix
      },
      borderRadius: {
        // Additifs, pas de redefinition de rounded-xl/2xl : ca reskinnerait
        // silencieusement tous les ecrans non encore retravailles. Ces deux
        // tokens ne seront appliques qu'aux ecrans explicitement repris a
        // partir de l'etape 3.
        card: "3px", // photo d'evenement en plein cadre — coin a peine casse, pas arrondi
        chip: "2px", // badges/etiquettes
      },
    },
  },
  plugins: [],
};
