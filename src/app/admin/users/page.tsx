import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

export default function AdminUsersPage() {
  // Données fictives pour la démonstration
  const users = [
    { id: "user-001", nom: "Jean Dupont", email: "jean.dupont@empresa-abc.com", role: "Client", organisation: "Empresa ABC", dateInscription: "15/01/2025", statut: "Actif" },
    { id: "user-002", nom: "Marie Martin", email: "marie.martin@be-csp.com", role: "Agent Support", organisation: "BE-CSP", dateInscription: "01/12/2024", statut: "Actif" },
    { id: "user-003", nom: "Pierre Dubois", email: "pierre.dubois@be-csp.com", role: "Agent Support", organisation: "BE-CSP", dateInscription: "01/12/2024", statut: "Actif" },
    { id: "user-004", nom: "Ana Garcia", email: "ana.garcia@tech-solutions.es", role: "Client", organisation: "Tech Solutions", dateInscription: "20/02/2025", statut: "Inactif" },
    { id: "user-005", nom: "Admin BE-CSP", email: "admin@be-csp.com", role: "Admin", organisation: "BE-CSP", dateInscription: "01/11/2024", statut: "Actif" },
  ];

  const roles = ["Client", "Agent Support", "Admin", "SuperAdmin"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-be-csp-neutral/10 dark:from-be-csp-text dark:to-black">
      <div className="container mx-auto p-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-be-csp-primary dark:text-white">Gestion des Utilisateurs (Admin)</h1>
            <p className="text-be-csp-neutral dark:text-be-csp-neutral/80">Gérez les comptes clients et agents</p>
          </div>
          <Button variant="accent">Inviter un utilisateur</Button>
        </header>

        {/* Filtres */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
            <CardDescription>Rechercher et filtrer les utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rôle</label>
                <select className="w-full p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30">
                  <option value="">Tous</option>
                  {roles.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Organisation</label>
                <input 
                  type="text" 
                  placeholder="Nom de l'organisation..." 
                  className="w-full p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select className="w-full p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30">
                  <option value="">Tous</option>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Recherche</label>
                <input 
                  type="text" 
                  placeholder="Nom, email..." 
                  className="w-full p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>Liste de tous les utilisateurs enregistrés</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.nom}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.organisation}</TableCell>
                    <TableCell>
                      <select defaultValue={user.role} className="p-1 border rounded-md text-xs dark:bg-be-csp-text dark:border-be-csp-neutral/30">
                        {roles.map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </TableCell>
                    <TableCell>{user.dateInscription}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.statut === "Actif" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                          : user.statut === "Inactif"
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}>
                        {user.statut}
                      </span>
                    </TableCell>
                    <TableCell className="space-x-1">
                      <Button variant="outline" size="sm">Modifier</Button>
                      {/* Ajouter options: Suspendre, Supprimer, Réinitialiser mot de passe */} 
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-be-csp-neutral">Affichage de 1-5 sur {users.length} utilisateurs</div>
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

