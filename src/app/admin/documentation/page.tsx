import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

export default function AdminDocumentationPage() {
  // Données fictives pour la démonstration
  const articles = [
    { id: "art-001", titre: "Configurer l'authentification multifacteur (MFA)", categorie: "Microsoft 365", date: "27/04/2025", auteur: "Sophie Lambert", statut: "Publié" },
    { id: "art-002", titre: "Créer une machine virtuelle sous Azure", categorie: "Azure", date: "26/04/2025", auteur: "Alexandre Dubois", statut: "Publié" },
    { id: "art-003", titre: "Premiers pas avec Power BI Desktop", categorie: "Power Platform", date: "25/04/2025", auteur: "Sophie Lambert", statut: "Brouillon" },
    { id: "art-004", titre: "Guide de migration Exchange Online", categorie: "Microsoft 365", date: "28/04/2025", auteur: "Alexandre Dubois", statut: "Publié" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-be-csp-neutral/10 dark:from-be-csp-text dark:to-black">
      <div className="container mx-auto p-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-be-csp-primary dark:text-white">Gestion de la Documentation (Admin)</h1>
            <p className="text-be-csp-neutral dark:text-be-csp-neutral/80">Créez, modifiez et gérez les articles du centre d'aide</p>
          </div>
          <Button variant="accent">Nouvel Article</Button>
        </header>

        {/* Filtres */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
            <CardDescription>Rechercher et filtrer les articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select className="w-full p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30">
                  <option value="">Tous</option>
                  <option value="publie">Publié</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="archive">Archivé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie</label>
                <select className="w-full p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30">
                  <option value="">Toutes</option>
                  <option value="m365">Microsoft 365</option>
                  <option value="azure">Azure</option>
                  {/* Ajouter d'autres catégories */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Auteur</label>
                <select className="w-full p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30">
                  <option value="">Tous</option>
                  <option value="sophie">Sophie Lambert</option>
                  <option value="alexandre">Alexandre Dubois</option>
                  {/* Ajouter d'autres auteurs */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Recherche</label>
                <input 
                  type="text" 
                  placeholder="Titre, contenu..." 
                  className="w-full p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des articles */}
        <Card>
          <CardHeader>
            <CardTitle>Articles de documentation</CardTitle>
            <CardDescription>Liste de tous les articles</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.id}</TableCell>
                    <TableCell>{article.titre}</TableCell>
                    <TableCell>{article.categorie}</TableCell>
                    <TableCell>{article.auteur}</TableCell>
                    <TableCell>{article.date}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        article.statut === "Publié" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                          : article.statut === "Brouillon"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {article.statut}
                      </span>
                    </TableCell>
                    <TableCell className="space-x-1">
                      <Button variant="outline" size="sm">Modifier</Button>
                      <Button variant="outline" size="sm">Voir</Button>
                      {/* Ajouter options: Archiver, Supprimer */} 
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-be-csp-neutral">Affichage de 1-4 sur {articles.length} articles</div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled>Précédent</Button>
                <Button variant="outline" size="sm" disabled>Suivant</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder pour l'éditeur d'article (pourrait être une modale ou une page dédiée) */}
        {/* Exemple: <AdminArticleEditor articleId={selectedArticleId} /> */}

      </div>
    </div>
  );
}

