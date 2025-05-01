'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile, UserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
import { format } from 'date-fns';
import { Ticket, FileText, Video, PlusCircle, Clock, PauseCircle, CheckCircle, LayoutDashboard, BookOpen, Film, Users } from 'lucide-react';

// Define interfaces for the data structures
interface TicketInterface {
  id: number;
  subject: string;
  status: string;
  created_at: string;
}

interface Resource {
  id: number;
  title: string;
  category_id: number;
  created_at: string;
  category_name?: string; 
}

interface TicketStats {
  total: number;
  en_cours: number;
  en_attente: number;
  resolu: number;
}

interface ResourceStats {
  total: number;
  articles: number;
  guides: number;
  webinaires: number;
}

// Componant StatCard pour afficher les statistiques
const StatCard = ({ 
  title, 
  value, 
  details, 
  icon, 
  accent = false 
}: { 
  title: string, 
  value: number | string, 
  details: { label: string, value: number | string }[], 
  icon: React.ReactNode,
  accent?: boolean
}) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <h3 className="stat-card-title">{title}</h3>
        <div className={`stat-card-icon-container ${accent ? 'bg-be-csp-accent/10' : 'bg-be-csp-primary/10'}`}>
          <div className={`stat-card-icon ${accent ? 'text-be-csp-accent' : 'text-be-csp-primary'}`}>
            {icon}
          </div>
        </div>
      </div>
      <div className={`stat-card-value ${accent ? 'text-be-csp-accent' : 'text-be-csp-primary'}`}>
        {value}
      </div>
      <div className="stat-card-details">
        {details.map((detail, index) => (
          <div key={index} className="stat-card-detail">
            <span className="stat-card-detail-label">{detail.label}</span>
            <span className="stat-card-detail-value">{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { userProfile, isAdmin, isAgent } = useUserProfile();
  
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const [ticketsRecents, setTicketsRecents] = useState<TicketInterface[]>([]);
  const [ressourcesRecentes, setRessourcesRecentes] = useState<Resource[]>([]);
  const [ticketStats, setTicketStats] = useState<TicketStats>({ total: 0, en_cours: 0, en_attente: 0, resolu: 0 });
  const [resourceStats, setResourceStats] = useState<ResourceStats>({ total: 0, articles: 0, guides: 0, webinaires: 0 });
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les profils d'utilisateurs pour les admins
  useEffect(() => {
    const loadProfiles = async () => {
      if (isAdmin && userProfile) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, organization, role, created_at, updated_at');
          
          if (error) throw error;
          
          const profiles = (data || []).map(profile => ({
            ...profile,
            email: null // Dans une vraie implémentation, vous devriez récupérer les emails
          }));
          
          setAllProfiles(profiles);
        } catch (err: any) {
          console.error("Erreur lors du chargement des profils:", err);
        }
      }
    };
    
    loadProfiles();
  }, [isAdmin, userProfile]);

  // Définir l'utilisateur sélectionné par défaut
  useEffect(() => {
    if (userProfile) {
      setSelectedUserId(userProfile.id);
    }
  }, [userProfile]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoadingTickets(true);
        setLoadingResources(true);
        setLoadingStats(true);
        setError(null);
        
        // Pour un admin/agent qui a sélectionné un utilisateur, afficher ses données
        // Sinon, afficher les données de l'utilisateur connecté
        const targetUserId = (isAdmin && selectedUserId) ? selectedUserId : user.id;
        
        // 1. Récupérer les tickets récents
        let { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select(`
            id,
            subject,
            status,
            created_at
          `)
          .eq('created_by_user_id', targetUserId)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (ticketsError) throw ticketsError;
        
        setTicketsRecents(ticketsData || []);
        setLoadingTickets(false);

        // 2. Calculer les statistiques des tickets
        let ticketStatsData = { 
          total: 0, 
          en_cours: 0, 
          en_attente: 0, 
          resolu: 0 
        };
        
        let { data: ticketCountData, error: countError } = await supabase
          .from('tickets')
          .select('status', { count: 'exact' })
          .eq('created_by_user_id', targetUserId);
        
        if (countError) throw countError;
        
        // Calculer le total
        ticketStatsData.total = ticketCountData?.length || 0;
        
        // Calculer par statut
        if (ticketCountData && ticketCountData.length > 0) {
          ticketCountData.forEach(ticket => {
            if (ticket.status === 'En cours') ticketStatsData.en_cours++;
            else if (ticket.status === 'En attente') ticketStatsData.en_attente++;
            else if (ticket.status === 'Résolu') ticketStatsData.resolu++;
          });
        }
        
        setTicketStats(ticketStatsData);
        
        // 3. Récupérer les ressources récentes (articles de documentation)
        let { data: articlesData, error: articlesError } = await supabase
          .from('documentation_articles')
          .select(`
            id,
            title,
            category_id,
            created_at,
            documentation_categories (name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (articlesError) throw articlesError;
        
        // Formater les ressources récentes
        const formattedResources = (articlesData || []).map(article => ({
          id: article.id,
          title: article.title,
          category_id: article.category_id,
          created_at: article.created_at,
          category_name: article.documentation_categories?.name || 'Non catégorisé'
        }));
        
        setRessourcesRecentes(formattedResources);
        setLoadingResources(false);
        
        // 4. Calculer les statistiques des ressources
        let resourceStatsData = { 
          total: 0, 
          articles: 0, 
          guides: 0, 
          webinaires: 0 
        };
        
        // Compter les articles par type
        let { data: articlesCountData, error: articleCountError } = await supabase
          .from('documentation_articles')
          .select('id, documentation_categories (id, name)', { count: 'exact' });
        
        if (articleCountError) throw articleCountError;
        
        resourceStatsData.total = articlesCountData?.length || 0;
        
        // Répartir par catégorie
        if (articlesCountData && articlesCountData.length > 0) {
          articlesCountData.forEach(article => {
            const categoryName = article.documentation_categories?.name?.toLowerCase() || '';
            if (categoryName.includes('article')) resourceStatsData.articles++;
            else if (categoryName.includes('guide')) resourceStatsData.guides++;
          });
        }
        
        // Récupérer le nombre de webinaires
        let { data: webinairesData, error: webinairesError } = await supabase
          .from('webinars')
          .select('id', { count: 'exact' });
        
        if (webinairesError) throw webinairesError;
        
        resourceStatsData.webinaires = webinairesData?.length || 0;
        resourceStatsData.total += resourceStatsData.webinaires;
        
        setResourceStats(resourceStatsData);
        setLoadingStats(false);

      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || 'Erreur lors du chargement des données.');
        setLoadingTickets(false);
        setLoadingResources(false);
        setLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, [user, selectedUserId, isAdmin]);

  // Helper to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return 'Date invalide';
    }
  };

  // Trouver l'utilisateur sélectionné
  const selectedUser = allProfiles.find(p => p.id === selectedUserId) || userProfile;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-semibold">Tableau de bord</h1>
        
        {/* Sélecteur d'utilisateur pour les administrateurs */}
        {isAdmin && allProfiles.length > 0 && (
          <div className="w-full md:w-64">
            <Select value={selectedUserId || ''} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {allProfiles.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name || profile.email || "Utilisateur"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Si admin, lien vers dashboard admin */}
        {isAdmin && (
          <Link href="/admin/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard Admin
            </Button>
          </Link>
        )}
      </div>
      
      {selectedUser && selectedUser.id !== userProfile?.id && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
          Vous consultez le tableau de bord de {selectedUser.full_name || selectedUser.email || "l'utilisateur sélectionné"}.
        </div>
      )}
      
      {error && <p className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">Erreur: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div>
          {loadingStats ? (
            <div className="stat-card animate-pulse">
              <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 w-1/2 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <StatCard
              title="Tickets"
              value={ticketStats.total}
              details={[
                { label: "En cours", value: ticketStats.en_cours },
                { label: "En attente", value: ticketStats.en_attente },
                { label: "Résolu(s)", value: ticketStats.resolu }
              ]}
              icon={<Ticket />}
            />
          )}
        </div>

        <div>
          {loadingStats ? (
            <div className="stat-card animate-pulse">
              <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 w-1/2 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <StatCard
              title="Ressources"
              value={`${resourceStats.total}+`}
              details={[
                { label: "Articles", value: resourceStats.articles },
                { label: "Guides", value: resourceStats.guides },
                { label: "Webinaires", value: resourceStats.webinaires }
              ]}
              icon={<FileText />}
              accent={true}
            />
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="tracking-tight text-gray-800">Actions rapides</CardTitle>
            <CardDescription>Accès direct aux fonctionnalités</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-3">
              <Link href="/tickets/new" passHref>
                <Button variant="default" className="flex w-full justify-between items-center bg-be-csp-primary hover:bg-be-csp-primary/90">
                  <div className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Nouveau ticket</span>
                  </div>
                  <Ticket className="h-4 w-4 opacity-70" />
                </Button>
              </Link>
              <Link href="/documentation" passHref>
                <Button variant="outline" className="flex w-full justify-between items-center border-gray-200 text-gray-700 hover:bg-gray-50">
                  <div className="flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Documentation</span>
                  </div>
                  <FileText className="h-4 w-4 opacity-70" />
                </Button>
              </Link>
              <Link href="/webinaires" passHref>
                <Button className="flex w-full justify-between items-center bg-be-csp-accent hover:bg-be-csp-accent/90">
                  <div className="flex items-center">
                    <Film className="mr-2 h-4 w-4" />
                    <span>Webinaires</span>
                  </div>
                  <Video className="h-4 w-4 opacity-70" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tableau des tickets récents */}
        <Card>
          <CardHeader>
            <CardTitle className="tracking-tight text-gray-800">Tickets récents</CardTitle>
            <CardDescription>Derniers tickets de support</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTickets ? <p>Chargement...</p> : ticketsRecents.length === 0 ? <p>Aucun ticket récent.</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ticketsRecents.map((ticket) => (
                    <TableRow key={ticket.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <Link href={`/tickets/${ticket.id}`}>TK-{ticket.id}</Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/tickets/${ticket.id}`}>{ticket.subject}</Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/tickets/${ticket.id}`}>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ticket.status === "En cours" 
                              ? "bg-blue-100 text-blue-800" 
                              : ticket.status === "En attente"
                              ? "bg-yellow-100 text-yellow-800"
                              : ticket.status === "Résolu"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {ticket.status === "En cours" && <Clock className="mr-1 h-3 w-3" />}
                            {ticket.status === "En attente" && <PauseCircle className="mr-1 h-3 w-3" />}
                            {ticket.status === "Résolu" && <CheckCircle className="mr-1 h-3 w-3" />}
                            {ticket.status}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/tickets/${ticket.id}`}>{formatDate(ticket.created_at)}</Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4 text-right">
              <Link href="/tickets" passHref>
                <Button variant="outline" size="sm" className="text-sm border-gray-200 text-gray-700 hover:bg-gray-50">
                  Voir tous les tickets
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Ressources récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="tracking-tight text-gray-800">Ressources récentes</CardTitle>
            <CardDescription>Derniers articles et documentation</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingResources ? <p>Chargement...</p> : ressourcesRecentes.length === 0 ? <p>Aucune ressource récente.</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ressourcesRecentes.map((resource) => (
                    <TableRow key={resource.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <Link href={`/documentation/${resource.id}`}>{resource.title}</Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/documentation/${resource.id}`}>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {resource.category_name}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/documentation/${resource.id}`}>{formatDate(resource.created_at)}</Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4 text-right">
              <Link href="/documentation" passHref>
                <Button variant="outline" size="sm" className="text-sm border-gray-200 text-gray-700 hover:bg-gray-50">
                  Voir toute la documentation
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 