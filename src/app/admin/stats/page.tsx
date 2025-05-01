import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminStatsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-be-csp-neutral/10 dark:from-be-csp-text dark:to-black">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-be-csp-primary dark:text-white">Statistiques Avancées</h1>
          <p className="text-be-csp-neutral dark:text-be-csp-neutral/80">Analyses détaillées des performances du support</p>
        </header>

        {/* Filtres de période */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Période d'analyse</CardTitle>
            <CardDescription>Sélectionnez la période pour les statistiques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="bg-be-csp-primary/10">7 derniers jours</Button>
              <Button variant="outline">30 derniers jours</Button>
              <Button variant="outline">3 derniers mois</Button>
              <Button variant="outline">6 derniers mois</Button>
              <Button variant="outline">12 derniers mois</Button>
              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-sm">Personnalisé:</span>
                <input type="date" className="p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30" />
                <span className="text-sm">à</span>
                <input type="date" className="p-2 border rounded-md dark:bg-be-csp-text dark:border-be-csp-neutral/30" />
                <Button variant="accent" size="sm">Appliquer</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques des tickets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Volume de tickets</CardTitle>
              <CardDescription>Évolution du nombre de tickets</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder pour graphique */}
              <div className="aspect-video bg-be-csp-neutral/20 dark:bg-black/30 rounded-md flex items-center justify-center">
                <p className="text-be-csp-neutral">Graphique: Volume de tickets par jour/semaine</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-be-csp-neutral">Total</p>
                  <p className="text-2xl font-bold text-be-csp-primary">187</p>
                </div>
                <div>
                  <p className="text-sm text-be-csp-neutral">Moyenne/jour</p>
                  <p className="text-2xl font-bold text-be-csp-primary">6.2</p>
                </div>
                <div>
                  <p className="text-sm text-be-csp-neutral">Tendance</p>
                  <p className="text-2xl font-bold text-green-500">+12%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Temps de résolution</CardTitle>
              <CardDescription>Durée moyenne de résolution des tickets</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder pour graphique */}
              <div className="aspect-video bg-be-csp-neutral/20 dark:bg-black/30 rounded-md flex items-center justify-center">
                <p className="text-be-csp-neutral">Graphique: Temps de résolution moyen</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-be-csp-neutral">Moyenne</p>
                  <p className="text-2xl font-bold text-be-csp-primary">4h 12m</p>
                </div>
                <div>
                  <p className="text-sm text-be-csp-neutral">Médiane</p>
                  <p className="text-2xl font-bold text-be-csp-primary">2h 45m</p>
                </div>
                <div>
                  <p className="text-sm text-be-csp-neutral">Tendance</p>
                  <p className="text-2xl font-bold text-green-500">-8%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques par catégorie et satisfaction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Tickets par catégorie</CardTitle>
              <CardDescription>Répartition des tickets par type</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder pour graphique */}
              <div className="aspect-video bg-be-csp-neutral/20 dark:bg-black/30 rounded-md flex items-center justify-center">
                <p className="text-be-csp-neutral">Graphique: Répartition par catégorie</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Microsoft 365</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div className="bg-be-csp-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-sm">45%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Azure</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div className="bg-be-csp-primary h-2.5 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <span className="text-sm">30%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Dynamics</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div className="bg-be-csp-primary h-2.5 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <span className="text-sm">15%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Power Platform</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div className="bg-be-csp-primary h-2.5 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="text-sm">10%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Satisfaction client</CardTitle>
              <CardDescription>Évaluation de la qualité du support</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder pour graphique */}
              <div className="aspect-video bg-be-csp-neutral/20 dark:bg-black/30 rounded-md flex items-center justify-center">
                <p className="text-be-csp-neutral">Graphique: Évolution de la satisfaction</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-be-csp-neutral">Satisfaction</p>
                  <p className="text-2xl font-bold text-be-csp-primary">92%</p>
                </div>
                <div>
                  <p className="text-sm text-be-csp-neutral">Réponses</p>
                  <p className="text-2xl font-bold text-be-csp-primary">143</p>
                </div>
                <div>
                  <p className="text-sm text-be-csp-neutral">Tendance</p>
                  <p className="text-2xl font-bold text-green-500">+3%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance des agents */}
        <Card>
          <CardHeader>
            <CardTitle>Performance des agents</CardTitle>
            <CardDescription>Statistiques par agent de support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Agent</th>
                    <th className="text-center py-3 px-4">Tickets traités</th>
                    <th className="text-center py-3 px-4">Temps moyen de réponse</th>
                    <th className="text-center py-3 px-4">Temps moyen de résolution</th>
                    <th className="text-center py-3 px-4">Satisfaction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Marie Martin</td>
                    <td className="text-center py-3 px-4">78</td>
                    <td className="text-center py-3 px-4">45 min</td>
                    <td className="text-center py-3 px-4">3h 20m</td>
                    <td className="text-center py-3 px-4">94%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Pierre Dubois</td>
                    <td className="text-center py-3 px-4">65</td>
                    <td className="text-center py-3 px-4">1h 10m</td>
                    <td className="text-center py-3 px-4">4h 45m</td>
                    <td className="text-center py-3 px-4">91%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Sophie Lambert</td>
                    <td className="text-center py-3 px-4">44</td>
                    <td className="text-center py-3 px-4">30 min</td>
                    <td className="text-center py-3 px-4">2h 50m</td>
                    <td className="text-center py-3 px-4">96%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Boutons d'export */}
        <div className="mt-8 flex justify-end space-x-4">
          <Button variant="outline">Exporter en CSV</Button>
          <Button variant="outline">Exporter en PDF</Button>
          <Button variant="accent">Générer rapport complet</Button>
        </div>
      </div>
    </div>
  );
}
