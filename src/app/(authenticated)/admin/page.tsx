import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

export default function AdminDashboard() {
  // Données fictives pour la démonstration
  const statistiquesGlobales = {
    ticketsOuverts: 24,
    ticketsEnAttente: 8,
    ticketsResolus: 156,
    tempsReponse: "2h 15min",
    tauxSatisfaction: "92%",
    utilisateursActifs: 87,
  };

  const ticketsRecents = [
    { id: "TK-2023", sujet: "Problème de connexion Microsoft 365", statut: "En cours", priorite: "Haute", client: "Empresa ABC", assigneA: "Marie Martin" },
    { id: "TK-2022", sujet: "Configuration Azure AD", statut: "En attente", priorite: "Moyenne", client: "Tech Solutions", assigneA: "Non assigné" },
    { id: "TK-2021", sujet: "Licence Power BI", statut: "En cours", priorite: "Basse", client: "Consultoria XYZ", assigneA: "Pierre Dubois" },
  ];

  const activiteRecente = [
    { action: "Ticket résolu", details: "TK-2020 - Erreur Sharepoint", utilisateur: "Pierre Dubois", date: "28/04/2025 14:35" },
    { action: "Article publié", details: "Guide de migration Exchange Online", utilisateur: "Sophie Lambert", date: "28/04/2025 11:20" },
    { action: "Ticket assigné", details: "TK-2023 assigné à Marie Martin", utilisateur: "Admin Système", date: "28/04/2025 09:45" },
  ];

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-be-csp-primary dark:text-white">Dashboard Administrateur</h1>
        <p className="text-be-csp-neutral dark:text-be-csp-neutral/80">Supervision et gestion du support BE-CSP</p>
      </header>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
            <CardDescription>Vue d'ensemble des tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-be-csp-neutral">Ouverts</p>
                <p className="text-2xl font-bold text-be-csp-primary">{statistiquesGlobales.ticketsOuverts}</p>
              </div>
              <div>
                <p className="text-sm text-be-csp-neutral">En attente</p>
                <p className="text-2xl font-bold text-yellow-500">{statistiquesGlobales.ticketsEnAttente}</p>
              </div>
              <div>
                <p className="text-sm text-be-csp-neutral">Résolus (total)</p>
                <p className="text-2xl font-bold text-green-500">{statistiquesGlobales.ticketsResolus}</p>
              </div>
              <div>
                <p className="text-sm text-be-csp-neutral">Temps de réponse</p>
                <p className="text-2xl font-bold text-be-csp-accent">{statistiquesGlobales.tempsReponse}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Satisfaction</CardTitle>
            <CardDescription>Retours des utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-5xl font-bold text-be-csp-primary mb-2">{statistiquesGlobales.tauxSatisfaction}</div>
              <p className="text-be-csp-neutral">Taux de satisfaction global</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>Activité de la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-5xl font-bold text-be-csp-primary mb-2">{statistiquesGlobales.utilisateursActifs}</div>
              <p className="text-be-csp-neutral">Utilisateurs actifs ce mois</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets récents */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tickets récents</CardTitle>
                <CardDescription>Derniers tickets ouverts</CardDescription>
              </div>
              <Button variant="outline" size="sm">Voir tous</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Assigné à</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ticketsRecents.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.id}</TableCell>
                      <TableCell>{ticket.sujet}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ticket.statut === "En cours" 
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                            : ticket.statut === "En attente"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        }`}>
                          {ticket.statut}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ticket.priorite === "Haute" 
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" 
                            : ticket.priorite === "Moyenne"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        }`}>
                          {ticket.priorite}
                        </span>
                      </TableCell>
                      <TableCell>{ticket.client}</TableCell>
                      <TableCell>{ticket.assigneA}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Assigner</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Activité récente */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Dernières actions sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activiteRecente.map((activite, index) => (
                  <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{activite.action}</span>
                      <span className="text-xs text-be-csp-neutral">{activite.date}</span>
                    </div>
                    <p className="text-sm mb-1">{activite.details}</p>
                    <p className="text-xs text-be-csp-neutral">Par {activite.utilisateur}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Accès direct aux fonctionnalités administrateur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="default" className="w-full">Gérer les tickets</Button>
              <Button variant="default" className="w-full">Éditer la documentation</Button>
              <Button variant="default" className="w-full">Gérer les utilisateurs</Button>
              <Button variant="accent" className="w-full">Statistiques avancées</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 