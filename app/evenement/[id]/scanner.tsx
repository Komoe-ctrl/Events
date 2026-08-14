import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ChampTexte } from "@/components/ChampTexte";
import { validerReservation } from "@/features/reservations/api";
import { ErreurApi, ErreurReseau } from "@/lib/apiClient";
import type { Reservation } from "@/types/reservation";

type Resultat =
  | { type: "succes"; reservation: Reservation }
  | { type: "deja_utilisee" }
  | { type: "annulee" }
  | { type: "introuvable" }
  | { type: "acces_refuse" }
  | { type: "reseau" }
  | { type: "inconnu"; message: string };

/**
 * Un code identifie une reservation unique, donc un evenement et un
 * organisateur uniques : le serveur ne distingue pas "code d'un autre
 * evenement" de "code d'un autre organisateur" (POST /reservations/valider
 * ne prend pas d'id d'evenement, ACCES_REFUSE couvre les deux — verifie
 * dans ReservationsService.valider()). "acces_refuse" ci-dessous couvre
 * donc "ce billet n'est pas pour un de vos evenements", quel que soit le
 * cas precis.
 */
function resultatDepuisErreur(e: unknown): Resultat {
  if (e instanceof ErreurReseau) {
    return { type: "reseau" };
  }
  if (e instanceof ErreurApi) {
    switch (e.code) {
      case "RESERVATION_DEJA_UTILISEE":
        return { type: "deja_utilisee" };
      case "RESERVATION_ANNULEE":
        return { type: "annulee" };
      case "RESSOURCE_INTROUVABLE":
        return { type: "introuvable" };
      case "ACCES_REFUSE":
        return { type: "acces_refuse" };
      default:
        return { type: "inconnu", message: e.message };
    }
  }
  return { type: "inconnu", message: "Une erreur inattendue est survenue." };
}

const PRESENTATION: Record<
  Exclude<Resultat["type"], "succes">,
  { icone: keyof typeof Ionicons.glyphMap; classeCarte: string; classeTexte: string; titre: string }
> = {
  deja_utilisee: {
    icone: "alert-circle",
    classeCarte: "border-amber-200 bg-amber-50",
    classeTexte: "text-amber-800",
    titre: "Déjà scanné",
  },
  annulee: {
    icone: "close-circle",
    classeCarte: "border-red-200 bg-red-50",
    classeTexte: "text-red-800",
    titre: "Réservation annulée",
  },
  introuvable: {
    icone: "help-circle",
    classeCarte: "border-line bg-surface-sunken",
    classeTexte: "text-ink-muted",
    titre: "Code inconnu",
  },
  acces_refuse: {
    icone: "ban",
    classeCarte: "border-red-200 bg-red-50",
    classeTexte: "text-red-800",
    titre: "Pas un de vos événements",
  },
  reseau: {
    icone: "cloud-offline",
    classeCarte: "border-line bg-surface-sunken",
    classeTexte: "text-ink-muted",
    titre: "Pas de connexion",
  },
  inconnu: {
    icone: "warning",
    classeCarte: "border-line bg-surface-sunken",
    classeTexte: "text-ink-muted",
    titre: "Erreur",
  },
};

function CarteResultat({
  resultat,
  onReessayer,
}: {
  resultat: Resultat;
  onReessayer: () => void;
}) {
  if (resultat.type === "succes") {
    return (
      <View className="mt-4 items-center rounded-xl border border-green-200 bg-green-50 p-6">
        <Ionicons name="checkmark-circle" size={40} color="#15803d" />
        <Text className="mt-2 text-lg font-semibold text-green-800">Billet validé</Text>
        <Text className="mt-1 text-sm text-green-700">
          {resultat.reservation.nombrePlaces} place
          {resultat.reservation.nombrePlaces > 1 ? "s" : ""}
        </Text>
      </View>
    );
  }

  const { icone, classeCarte, classeTexte, titre } = PRESENTATION[resultat.type];
  return (
    <View className={`mt-4 items-center rounded-xl border p-6 ${classeCarte}`}>
      <Ionicons name={icone} size={40} color={classeTexte.includes("red") ? "#b91c1c" : "#6B6560"} />
      <Text className={`mt-2 text-lg font-semibold ${classeTexte}`}>{titre}</Text>
      {resultat.type === "inconnu" ? (
        <Text className={`mt-1 text-sm ${classeTexte}`}>{resultat.message}</Text>
      ) : null}
      {resultat.type === "reseau" ? (
        <Pressable
          onPress={onReessayer}
          className="mt-4 rounded-lg border border-line bg-surface px-4 py-2 active:opacity-70"
        >
          <Text className="text-sm font-medium text-ink">Réessayer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function Scanner() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"manuel" | "camera">("manuel");
  const [code, setCode] = useState("");
  const [dernierCodeTente, setDernierCodeTente] = useState("");
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [permission, demanderPermission] = useCameraPermissions();

  // Chemin de validation unique, partage entre saisie manuelle et camera —
  // seule la source du code change, jamais la logique qui le traite.
  const mutation = useMutation({
    mutationFn: (code: string) => validerReservation(code),
    onSuccess: (reservation) => {
      setResultat({ type: "succes", reservation });
      setCode("");
      queryClient.invalidateQueries({
        queryKey: ["evenements", reservation.evenementId, "inscrits"],
      });
    },
    onError: (e) => {
      setResultat(resultatDepuisErreur(e));
    },
  });

  const soumettreCode = (valeur: string) => {
    const nettoye = valeur.trim().toUpperCase();
    setDernierCodeTente(nettoye);
    setResultat(null);
    mutation.mutate(nettoye);
  };

  const valider = () => {
    if (code.trim().length === 0) {
      setResultat({ type: "inconnu", message: "Entre un code." });
      return;
    }
    soumettreCode(code);
  };

  // Un QR reste dans le cadre plusieurs frames de suite : sans garde,
  // onBarcodeScanned rappellerait soumettreCode() en boucle pour le meme
  // code tant qu'il est visible. Une fois qu'un resultat est affiche (succes
  // ou erreur), la camera cesse d'etre ecoutee jusqu'a ce que l'utilisateur
  // tape explicitement "Scanner a nouveau" (qui remet resultat a null).
  const gererCodeScanne = ({ data }: { data: string }) => {
    if (mutation.isPending || resultat) return;
    soumettreCode(data);
  };

  const passerEnModeCamera = async () => {
    const reponse = permission?.granted ? permission : await demanderPermission();
    if (reponse.granted) {
      setResultat(null);
      setMode("camera");
    }
    // Refus : on reste simplement en mode manuel (deja affiche par defaut),
    // jamais d'ecran camera bloque ou vide a la place.
  };

  const formulaireManuel = (
    <View className="flex-1 bg-surface p-6">
      <ChampTexte
        label="Code de la réservation"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        placeholder="AG3NEB98"
      />

      <Pressable
        onPress={valider}
        disabled={mutation.isPending}
        className="items-center rounded-xl bg-brand-600 py-3 active:opacity-80 disabled:opacity-50"
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-base font-medium text-white">Valider</Text>
        )}
      </Pressable>

      <Pressable
        onPress={passerEnModeCamera}
        className="mt-3 items-center rounded-xl border border-line py-3 active:opacity-70"
      >
        <Text className="text-base font-medium text-ink">Scanner avec la caméra</Text>
      </Pressable>

      {resultat ? (
        <CarteResultat resultat={resultat} onReessayer={() => soumettreCode(dernierCodeTente)} />
      ) : null}
    </View>
  );

  if (mode === "manuel") {
    return formulaireManuel;
  }

  return (
    <View className="flex-1 bg-surface">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={gererCodeScanne}
      />
      <View className="bg-surface p-6">
        {resultat ? (
          <>
            <CarteResultat
              resultat={resultat}
              onReessayer={() => soumettreCode(dernierCodeTente)}
            />
            <Pressable
              onPress={() => setResultat(null)}
              className="mt-3 items-center rounded-xl bg-brand-600 py-3 active:opacity-80"
            >
              <Text className="text-base font-medium text-white">Scanner à nouveau</Text>
            </Pressable>
          </>
        ) : (
          <Text className="text-center text-sm text-ink-muted">
            Cadre le QR code du billet.
          </Text>
        )}
        <Pressable onPress={() => setMode("manuel")} className="mt-3 items-center py-2">
          <Text className="text-sm font-medium text-brand-600">Saisir le code à la main</Text>
        </Pressable>
      </View>
    </View>
  );
}
