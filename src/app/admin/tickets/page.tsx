import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

export default function AdminTicketsPage() {
  // Données fictives pour la démonstration
  const tickets = [
    { id: "TK-2023", sujet: "Problème de connexion Microsoft 365", statut: "En cours", priorite: "Haute", client: "Empresa ABC", assigneA: "Marie Martin", date: "28/04/2025" },
    { id: "TK-2022", sujet: "Configuration Azure AD", statut: "En attente", priorite: "Moyenne", client: "Tech Solutions", assigneA: "Non assigné", date: "27/04/2025" },
    { id: "TK-2021", sujet: "Licence Power BI", statut: "En cours", priorite: "Basse", client: "Consultoria XYZ", assigneA: "Pierre Dubois", date: "26/04/2025" },
    { id: "TK-2020", sujet: "Erreur Sharepoint", statut: "Résolu", priorite: "Moyenne", client: "Innovatech", assigneA: "Pierre Dubois", date: "25/04/2025" },
    { id: "TK-2019", sujet: "Migration Exchange Online", statut: "En attente", priorite: "Haute", client: "Global Corp", assigneA: "Non assigné", date: "24/04/2025" },
  ];

  const agents = ["Marie Martin", "Pierre Dubois", "Sophie Lambert", "Non assigné"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-be-csp-neutral/10 dark:from-be-csp-text dark:to-black">
      <div className="container mx-auto p-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-be-csp-primary dark:text-white">Gestion des Tickets (Admin)</h1>
            <p className="text-be-csp-neutral dark:text-be-csp-neutral/80">Assignez, suivez et gérez tous les tickets de support</p>
          </div>
          {/* Optionnel: Bouton pour créer un ticket depuis l'admin */}
        </header>

        {/* Filtres Admin */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtres et Tri</CardTitle>
            <CardDescription>Affinez la liste des tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select className="w-full p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30">
                  <option value="">Tous</option>
                  <option value="en-cours">En cours</option>
                  <option value="en-attente">En attente</option>
                  <option value="resolu">Résolu</option>
                  <option value="ferme">Fermé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priorité</label>
                <select className="w-full p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30">
                  <option value="">Toutes</option>
                  <option value="haute">Haute</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="basse">Basse</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assigné à</label>
                <select className="w-full p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30">
                  <option value="">Tous</option>
                  {agents.map(agent => <option key={agent} value={agent}>{agent}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client</label>
                <input 
                  type="text" 
                  placeholder="Nom du client..." 
                  className="w-full p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Recherche</label>
                <input 
                  type="text" 
                  placeholder="ID, sujet..." 
                  className="w-full p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Tous les tickets</CardTitle>
            <CardDescription>Liste complète des tickets de support</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Assigné à</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell>{ticket.sujet}</TableCell>
                    <TableCell>{ticket.client}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ticket.statut === "En cours" 
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                          : ticket.statut === "En attente"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : ticket.statut === "Résolu"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
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
                    <TableCell>{ticket.date}</TableCell>
                    <TableCell>
                      <select defaultValue={ticket.assigneA} className="p-1 border rounded-md text-xs dark:bg-be-csp-text dark:border-be-csp-neutral/30">
                        {agents.map(agent => <option key={agent} value={agent}>{agent}</option>)}
                      </select>
                    </TableCell>
                    <TableCell className="space-x-1">
                      <Button variant="outline" size="sm">Voir</Button>
                      <Button variant="accent" size="sm">Assigner</Button> {/* Ou Mettre à jour */} 
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-be-csp-neutral">Affichage de 1-5 sur {tickets.length} tickets</div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>Précédent</Button>
                <Button variant="outline" size="sm">Suivant</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

