"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { FileIcon, PaperclipIcon, SendIcon, MoreVertical, ChevronLeft, CheckCircle, Clock, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import React from "react";

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  // Unwrap params using React.use()
  const resolvedParams = React.use(params);
  const ticketId = resolvedParams.id;
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Format date helper function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return "Invalid date";
    }
  };

  // Fetch ticket data
  useEffect(() => {
    async function fetchTicket() {
      if (!ticketId) return;
      
      try {
        setLoading(true);
        const { data: ticketData, error: ticketError } = await supabase
          .from("tickets")
          .select(`
            *,
            created_by:profiles!tickets_created_by_user_id_fkey(id, full_name, email),
            assignee:profiles!tickets_assigned_to_user_id_fkey(id, full_name, email)
          `)
          .eq("id", ticketId)
          .single();

        if (ticketError) throw ticketError;
        
        // Restructurer les données pour maintenir la compatibilité avec le reste du code
        const formattedTicket = {
          ...ticketData,
          created_by: ticketData.created_by?.[0] || null,
          assignee: ticketData.assignee?.[0] || null
        };
        
        setTicket(formattedTicket);

        // Fetch comments for this ticket
        const { data: commentsData, error: commentsError } = await supabase
          .from("ticket_comments")
          .select(`
            id, 
            ticket_id, 
            content, 
            created_at,
            user_id,
            user:user_id(id, full_name, email)
          `)
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: true });

        if (commentsError) throw commentsError;
        setComments(commentsData || []);

        // Fetch attachments
        const { data: filesData, error: filesError } = await supabase
          .storage
          .from("ticket-attachments")
          .list(`${ticketId}`);

        if (filesError) throw filesError;
        setFiles(filesData || []);
      } catch (error: any) {
        console.error("Error fetching ticket:", error.message);
        setTicket(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTicket();
  }, [ticketId]);

  // Add a new comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from("ticket_comments")
        .insert({
          ticket_id: parseInt(ticketId),
          content: newComment.trim(),
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select(`
          id, 
          ticket_id, 
          content, 
          created_at,
          user_id,
          user:user_id(id, full_name, email)
        `);

      if (error) throw error;

      setComments([...comments, data[0]]);
      setNewComment("");
    } catch (error: any) {
      console.error("Error adding comment:", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Download file
  const handleDownloadFile = async (fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("ticket-attachments")
        .download(`${ticketId}/${fileName}`);
      
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error("Error downloading file:", error.message);
    }
  };

  // Handle status updates
  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", ticketId);

      if (error) throw error;
      
      setTicket({ ...ticket, status: newStatus, updated_at: new Date().toISOString() });
    } catch (error: any) {
      console.error("Error updating status:", error.message);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Ouvert":
        return <Clock className="h-4 w-4 mr-1" />;
      case "En cours":
        return <Loader2 className="h-4 w-4 mr-1" />;
      case "Résolu":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "Fermé":
        return <XCircle className="h-4 w-4 mr-1" />;
      case "En attente":
        return <AlertCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
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

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          <p className="mb-3">Ticket introuvable ou vous n'avez pas la permission de le voir.</p>
          <Button 
            className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50" 
            onClick={() => router.push("/tickets")}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className={getStatusBadgeColor(ticket.status)}>
              <div className="flex items-center">
                {getStatusIcon(ticket.status)}
                {ticket.status}
              </div>
            </Badge>
            <Badge className={getPriorityBadgeColor(ticket.priority)}>
              {ticket.priority}
            </Badge>
          </div>
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <p className="text-sm text-gray-500">Ticket #{ticket.id} · {formatDate(ticket.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={() => router.push("/tickets")}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                Changer le statut
                <MoreVertical className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleStatusChange("Ouvert")}>
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                <span>Ouvert</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("En cours")}>
                <Loader2 className="h-4 w-4 mr-2 text-amber-500" />
                <span>En cours</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("En attente")}>
                <AlertCircle className="h-4 w-4 mr-2 text-be-csp-accent" />
                <span>En attente</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("Résolu")}>
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span>Résolu</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("Fermé")}>
                <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                <span>Fermé</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Ticket description */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="text-lg font-medium text-gray-800">Description</h3>
            </div>
            <div className="whitespace-pre-wrap text-gray-700">{ticket.description}</div>
          </div>
          
          {/* Comments section */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="text-lg font-medium text-gray-800">Commentaires</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <p className="text-gray-500">Aucun commentaire pour le moment.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg bg-gray-50 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-be-csp-accent/10 text-be-csp-accent mr-2">
                          {comment.user?.full_name?.charAt(0) || comment.user?.email?.charAt(0) || "U"}
                        </div>
                        <p className="font-medium text-gray-800">
                          {comment.user?.full_name || comment.user?.email || "Utilisateur inconnu"}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <div className="ml-10">
                      <p className="whitespace-pre-wrap text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleAddComment} className="space-y-3">
              <Textarea
                placeholder="Ajouter un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] border-gray-200 focus:border-be-csp-accent focus:ring-be-csp-accent"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="bg-be-csp-accent hover:bg-be-csp-accent/90"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <SendIcon className="h-4 w-4 mr-2" />
                      Envoyer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Ticket information */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h3 className="text-lg font-medium text-gray-800">Détails</h3>
            </div>
            
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <p className="text-sm text-gray-500 mb-1">Catégorie</p>
                <p className="font-medium">{ticket.category}</p>
              </div>
              
              <div className="border-b border-gray-100 pb-3">
                <p className="text-sm text-gray-500 mb-1">Créé par</p>
                <div className="flex items-center">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-700 mr-2">
                    {ticket.created_by?.full_name?.charAt(0) || ticket.created_by?.email?.charAt(0) || "U"}
                  </div>
                  <p className="font-medium">{ticket.created_by?.full_name || ticket.created_by?.email || "Inconnu"}</p>
                </div>
              </div>
              
              <div className="border-b border-gray-100 pb-3">
                <p className="text-sm text-gray-500 mb-1">Assigné à</p>
                {ticket.assignee ? (
                  <div className="flex items-center">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-700 mr-2">
                      {ticket.assignee?.full_name?.charAt(0) || ticket.assignee?.email?.charAt(0) || "U"}
                    </div>
                    <p className="font-medium">{ticket.assignee?.full_name || ticket.assignee?.email}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Non assigné</p>
                )}
              </div>
              
              <div className="border-b border-gray-100 pb-3">
                <p className="text-sm text-gray-500 mb-1">Créé le</p>
                <p className="font-medium">{formatDate(ticket.created_at)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Dernière mise à jour</p>
                <p className="font-medium">{formatDate(ticket.updated_at)}</p>
              </div>
            </div>
          </div>
          
          {/* Attachments section */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="flex items-center">
                <PaperclipIcon className="h-5 w-5 text-be-csp-accent mr-2" />
                <h3 className="text-lg font-medium text-gray-800">Pièces jointes</h3>
              </div>
            </div>
            
            <div className="space-y-2">
              {files.length === 0 ? (
                <p className="text-gray-500">Aucune pièce jointe</p>
              ) : (
                files.map((file) => (
                  <div 
                    key={file.id} 
                    className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleDownloadFile(file.name)}
                  >
                    <div className="bg-gray-100 p-2 rounded-md mr-3">
                      <FileIcon className="h-5 w-5 text-be-csp-accent" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="truncate font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.metadata?.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 