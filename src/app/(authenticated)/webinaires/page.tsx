import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function WebinairesPage() {
  // Données fictives pour la démonstration
  const webinairesAVenir = [
    {
      titre: "Optimiser vos coûts Azure",
      date: "15/05/2025",
      heure: "11:00 CEST",
      description: "Découvrez les meilleures pratiques pour réduire votre facture Azure sans impacter les performances.",
      intervenant: "Alexandre Dubois, Expert Cloud BE-CSP",
    },
    {
      titre: "Nouveautés Microsoft 365 Copilot",
      date: "22/05/2025",
      heure: "14:00 CEST",
      description: "Présentation des dernières fonctionnalités de Copilot et comment les intégrer dans votre quotidien.",
      intervenant: "Sophie Lambert, Spécialiste M365 BE-CSP",
    },
  ];

  const webinairesReplay = [
    {
      titre: "Sécurisation avancée d'Azure AD",
      date: "18/04/2025",
      videoId: "placeholder_video_id_1", // Remplacer par un vrai ID vidéo (ex: YouTube)
      description: "Revivez notre session sur les techniques avancées pour sécuriser votre environnement Azure Active Directory.",
    },
    {
      titre: "Introduction à Power Automate",
      date: "11/04/2025",
      videoId: "placeholder_video_id_2", // Remplacer par un vrai ID vidéo
      description: "Apprenez les bases de Power Automate pour automatiser vos tâches répétitives.",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-be-csp-primary dark:text-white">Webinaires BE-CSP</h1>
        <p className="text-be-csp-neutral dark:text-be-csp-neutral/80">Restez informé avec nos sessions en direct et nos replays.</p>
      </header>

      {/* Webinaires à venir */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Prochains Webinaires</CardTitle>
          <CardDescription>Inscrivez-vous à nos prochaines sessions en direct.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {webinairesAVenir.map((webinaire, index) => (
              <Card key={index} className="flex flex-col md:flex-row dark:bg-be-csp-text/70">
                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-semibold text-be-csp-primary dark:text-white mb-1">{webinaire.titre}</h3>
                  <p className="text-sm text-be-csp-neutral mb-3">
                    Le {webinaire.date} à {webinaire.heure} - Par {webinaire.intervenant}
                  </p>
                  <p className="mb-4">{webinaire.description}</p>
                  <Button variant="accent">S'inscrire</Button>
                </div>
                {/* Optionnel: Ajouter une image ou icône */}
                {/* <div className="md:w-1/4 bg-gray-200 dark:bg-gray-700 flex items-center justify-center p-4 rounded-r-lg">Image</div> */}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Replays */}
      <Card>
        <CardHeader>
          <CardTitle>Webinaires en Replay</CardTitle>
          <CardDescription>Accédez aux enregistrements de nos sessions passées.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {webinairesReplay.map((replay, index) => (
              <Card key={index} className="dark:bg-be-csp-text/70">
                <CardHeader>
                  {/* Placeholder pour le lecteur vidéo intégré */}
                  <div className="aspect-video bg-be-csp-neutral/20 dark:bg-black/30 rounded-md flex items-center justify-center mb-4">
                    <p className="text-be-csp-neutral">Lecteur Vidéo (ID: {replay.videoId})</p>
                  </div>
                  <CardTitle className="text-lg text-be-csp-primary dark:text-white">{replay.titre}</CardTitle>
                  <CardDescription>Session du {replay.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{replay.description}</p>
                  <Button variant="outline" className="w-full">Regarder le replay</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 