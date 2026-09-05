export type InstitutionalBody = {
  name: string;
  title: string;
  preparationTitle: string;
  preparationButton: string;
  officialAgendaLabel: string;
  decisionLabel: string;
  sessionInformationTitle: string;
  locationPlaceholder: string;
};

export function getInstitutionalBody(
  level: string,
): InstitutionalBody | null {
  if (level === "commune") {
    return {
      name: "conseil municipal",
      title: "Conseil municipal",
      preparationTitle: "Préparation du conseil municipal",
      preparationButton: "Préparer le conseil municipal",
      officialAgendaLabel: "du conseil municipal",
      decisionLabel: "du conseil municipal",
      sessionInformationTitle:
        "Informations du conseil municipal",
      locationPlaceholder:
        "Exemple : salle du conseil municipal",
    };
  }

  if (level === "epci") {
    return {
      name: "conseil communautaire",
      title: "Conseil communautaire",
      preparationTitle:
        "Préparation du conseil communautaire",
      preparationButton:
        "Préparer le conseil communautaire",
      officialAgendaLabel:
        "du conseil communautaire",
      decisionLabel:
        "du conseil communautaire",
      sessionInformationTitle:
        "Informations du conseil communautaire",
      locationPlaceholder:
        "Exemple : salle du conseil communautaire",
    };
  }

  if (level === "department") {
    return {
      name: "assemblée départementale",
      title: "Assemblée départementale",
      preparationTitle:
        "Préparation de l’assemblée départementale",
      preparationButton:
        "Préparer l’assemblée départementale",
      officialAgendaLabel:
        "de l’assemblée départementale",
      decisionLabel:
        "de l’assemblée départementale",
      sessionInformationTitle:
        "Informations de l’assemblée départementale",
      locationPlaceholder:
        "Exemple : salle de l’assemblée départementale",
    };
  }

  return null;
}
