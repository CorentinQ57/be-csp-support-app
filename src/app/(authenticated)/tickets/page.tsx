'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, SearchIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { EmptyState } from "@/components/ui/EmptyState";

interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
  created_by: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
  assignee: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

export default function TicketsPage() {
  // State variables
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 10;

  // Format date helper function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // Load tickets with filters and pagination
  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("tickets")
        .select(`
          *,
          created_by:profiles!tickets_created_by_user_id_fkey(id, full_name, email),
          assignee:profiles!tickets_assigned_to_user_id_fkey(id, full_name, email)
        `, { count: "exact" });

      // Apply filters
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      
      if (priorityFilter !== "all") {
        query = query.eq("priority", priorityFilter);
      }
      
      if (searchTerm) {
        query = query.or(`subject.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, count, error } = await query
        .order("updated_at", { ascending: false })
        .range(from, to);

      if (error) throw new Error(error.message);
      
      // Restructure data to maintain compatibility
      if (data) {
        const formattedData = data.map(ticket => {
          return {
            id: ticket.id,
            subject: ticket.subject,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            category: ticket.category,
            created_at: ticket.created_at,
            updated_at: ticket.updated_at,
            created_by: ticket.created_by?.[0] || null,
            assignee: ticket.assignee?.[0] || null
          };
        });
        
        setTickets(formattedData);
      } else {
        setTickets([]);
      }
      
      setTotalCount(count || 0);
      setPageCount(Math.ceil((count || 0) / pageSize));
    } catch (err: any) {
      setError(err.message);
      console.error("Error loading tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load tickets when filters or pagination changes
  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, searchTerm, currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pageCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Ouvert":
        return "bg-blue-500 text-white";
      case "En cours":
        return "bg-amber-500 text-white";
      case "Résolu":
        return "bg-green-500 text-white";
      case "Fermé":
        return "bg-gray-500 text-white";
      case "En attente":
        return "bg-be-csp-accent text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "Basse":
        return "bg-green-100 text-green-800";
      case "Moyenne":
        return "bg-amber-100 text-amber-800";
      case "Haute":
        return "bg-orange-100 text-orange-800";
      case "Urgente":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Tickets d'assistance</h1>
          <Link href="/tickets/new">
            <Button className="bg-be-csp-accent hover:bg-be-csp-accent/90">
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouveau ticket
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="Ouvert">Ouvert</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Résolu">Résolu</SelectItem>
                  <SelectItem value="Fermé">Fermé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <Select 
                value={priorityFilter} 
                onValueChange={(value) => {
                  setPriorityFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les priorités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="Basse">Basse</SelectItem>
                  <SelectItem value="Moyenne">Moyenne</SelectItem>
                  <SelectItem value="Haute">Haute</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Rechercher par sujet ou description"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>Une erreur est survenue: {error}</p>
            <Button 
              onClick={loadTickets} 
              variant="outline" 
              className="mt-2 bg-white"
            >
              Réessayer
            </Button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 w-full">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Empty state */}
        {!loading && tickets.length === 0 && !error && (
          <EmptyState 
            title="Aucun ticket trouvé" 
            description="Aucun ticket ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou créez un nouveau ticket."
            icon={
              <div className="bg-be-csp-accent/10 p-3 rounded-full">
                <SearchIcon className="h-6 w-6 text-be-csp-accent" />
              </div>
            }
            action={
              <Link href="/tickets/new">
                <Button className="bg-be-csp-accent hover:bg-be-csp-accent/90">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nouveau ticket
                </Button>
              </Link>
            }
          />
        )}

        {/* Tickets list */}
        {!loading && tickets.length > 0 && (
          <>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Link 
                  href={`/tickets/${ticket.id}`} 
                  key={ticket.id}
                  className="block bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStatusBadgeColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <Badge className={getPriorityBadgeColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant="outline" className="bg-gray-50">
                          {ticket.category}
                        </Badge>
                      </div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {ticket.subject}
                      </h2>
                      <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
                        <span>ID: {ticket.id}</span>
                        <span>Créé le: {formatDate(ticket.created_at)}</span>
                        <span>
                          Par: {ticket.created_by?.full_name || ticket.created_by?.email || "Inconnu"}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {ticket.assignee ? (
                        <div className="flex items-center">
                          <span className="mr-2">Assigné à:</span>
                          <div className="flex items-center">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-700 mr-2">
                              {ticket.assignee?.full_name?.charAt(0) || ticket.assignee?.email?.charAt(0) || "?"}
                            </div>
                            <span>{ticket.assignee?.full_name || ticket.assignee?.email}</span>
                          </div>
                        </div>
                      ) : (
                        <span>Non assigné</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500">
                  Affichage de {(currentPage - 1) * pageSize + 1} à {Math.min(currentPage * pageSize, totalCount)} sur {totalCount} tickets
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="bg-white"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={currentPage === pageCount}
                    className="bg-white"
                  >
                    Suivant <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
} 