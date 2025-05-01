'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui-bridge/card";
import { Button } from "@/components/ui-bridge/button";
import { Input } from '@/components/ui-bridge/input';
import { Textarea } from '@/components/ui-bridge/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewTicketPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Form state
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Moyenne'); // Default priority
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<FileList | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAttachments(event.target.files);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setError('Utilisateur non authentifié.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. Insert the ticket data
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          subject: subject,
          description: description,
          category: category,
          priority: priority,
          created_by_user_id: user.id,
          status: 'Ouvert' // Default status
        })
        .select() // Return the inserted row
        .single(); // Expecting a single row back

      if (ticketError) {
        throw ticketError;
      }

      const newTicketId = ticketData.id;

      // 2. Handle file uploads (Optional - Basic implementation)
      if (attachments && attachments.length > 0) {
        // Create a message first to link attachments to
        const { data: messageData, error: messageError } = await supabase
          .from('ticket_messages')
          .insert({
            ticket_id: newTicketId,
            user_id: user.id,
            message: `Ticket créé avec ${attachments.length} pièce(s) jointe(s).` // Placeholder message
          })
          .select()
          .single();
        
        if (messageError) throw messageError;
        const newMessageId = messageData.id;

        for (const file of Array.from(attachments)) {
          const filePath = `${user.id}/${newTicketId}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('ticket_attachments') // Use the bucket name created earlier
            .upload(filePath, file);

          if (uploadError) {
            console.error('Error uploading file:', file.name, uploadError);
            // Continue trying other files, but maybe log this error
          } else {
            // Insert attachment metadata into the database
            const { error: metaError } = await supabase
              .from('ticket_attachments')
              .insert({
                message_id: newMessageId,
                file_name: file.name,
                storage_path: filePath,
                file_size: file.size,
                mime_type: file.type,
                uploaded_by_user_id: user.id
              });
            if (metaError) {
              console.error('Error saving attachment metadata:', file.name, metaError);
            }
          }
        }
      }

      setSuccessMessage('Ticket créé avec succès !');
      // Optionally clear the form
      setCategory('');
      setPriority('Moyenne');
      setSubject('');
      setDescription('');
      setAttachments(null);
      // Redirect to the new ticket's detail page
      router.push(`/tickets/${newTicketId}`);
      router.refresh(); // Refresh server components if needed

    } catch (err: any) {
      console.error('Error creating ticket:', err);
      setError(err.message || 'Une erreur est survenue lors de la création du ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-be-csp-primary dark:text-white">Créer un nouveau ticket</h1>
        <p className="text-be-csp-neutral dark:text-be-csp-neutral/80">Décrivez votre problème ou votre demande</p>
      </header>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Informations sur le ticket</CardTitle>
          <CardDescription>Veuillez fournir autant de détails que possible.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Category and Priority */} 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">Catégorie</label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Sélectionner une catégorie..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Microsoft 365">Microsoft 365</SelectItem>
                    <SelectItem value="Azure">Azure</SelectItem>
                    <SelectItem value="Dynamics">Dynamics</SelectItem>
                    <SelectItem value="Power Platform">Power Platform</SelectItem>
                    <SelectItem value="Licences & Facturation">Licences & Facturation</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium mb-1">Priorité</label>
                <Select value={priority} onValueChange={setPriority} required>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basse">Basse</SelectItem>
                    <SelectItem value="Moyenne">Moyenne</SelectItem>
                    <SelectItem value="Haute">Haute</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject */} 
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-1">Sujet</label>
              <Input 
                type="text" 
                id="subject" 
                name="subject" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="Résumez votre problème en quelques mots" 
                className="w-full p-2 border rounded-md dark:bg-be-csp-text/80 dark:border-be-csp-neutral/30"
              />
            </div>

            {/* Description */} 
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
              <Textarea 
                id="description" 
                name="description" 
                rows={6} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Décrivez en détail votre problème, les étapes pour le reproduire, et ce que vous avez déjà essayé."
                className="w-full p-2 border rounded-md dark:bg-be-csp-text/80 dark:border-be-csp-neutral/30"
              />
            </div>

            {/* Attachments */} 
            <div>
              <label htmlFor="attachments" className="block text-sm font-medium mb-1">Pièces jointes</label>
              <Input 
                type="file" 
                id="attachments" 
                name="attachments" 
                multiple 
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md dark:bg-be-csp-text/80 dark:border-be-csp-neutral/30 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-be-csp-primary/10 file:text-be-csp-primary hover:file:bg-be-csp-primary/20 dark:file:bg-be-csp-primary/20 dark:file:text-white"
              />
              <p className="mt-1 text-xs text-be-csp-neutral">Vous pouvez joindre des captures d'écran ou d'autres fichiers pertinents.</p>
            </div>

            {/* Error/Success Messages */} 
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">Erreur: {error}</p>
            )}
            {successMessage && (
              <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
            )}

            {/* Action Buttons */} 
            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => router.back()} disabled={loading}>
                Annuler
              </Button>
              <Button variant="accent" type="submit" disabled={loading}>
                {loading ? 'Création en cours...' : 'Créer le ticket'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 