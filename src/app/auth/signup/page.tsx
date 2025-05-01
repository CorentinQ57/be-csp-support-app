
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Add fields for user metadata if needed, e.g., name, organization
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Add user metadata here if needed
          data: {
            full_name: fullName,
            organization: organization,
            // Add other fields as necessary, ensure they match your Supabase setup
          }
        }
      });

      if (error) {
        throw error;
      }

      // Handle success - typically Supabase sends a confirmation email
      setSuccessMessage('Inscription réussie ! Veuillez vérifier votre e-mail pour confirmer votre compte.');
      // Optionally redirect or clear form
      // router.push('/auth/login');

    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue lors de l\inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-be-csp-neutral/10 dark:from-be-csp-text dark:to-black">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-be-csp-primary dark:text-white">Inscription</CardTitle>
          <CardDescription className="text-center">Créez votre compte BE-CSP Support</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            {/* Add inputs for fullName and organization */} 
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium">Nom complet</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full p-3 border rounded-md dark:bg-be-csp-text/80 dark:border-be-csp-neutral/30 focus:ring-2 focus:ring-be-csp-primary focus:outline-none"
                placeholder="Votre nom complet"
              />
            </div>
             <div className="space-y-2">
              <label htmlFor="organization" className="block text-sm font-medium">Organisation</label>
              <input
                id="organization"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
                className="w-full p-3 border rounded-md dark:bg-be-csp-text/80 dark:border-be-csp-neutral/30 focus:ring-2 focus:ring-be-csp-primary focus:outline-none"
                placeholder="Nom de votre entreprise"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Adresse e-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border rounded-md dark:bg-be-csp-text/80 dark:border-be-csp-neutral/30 focus:ring-2 focus:ring-be-csp-primary focus:outline-none"
                placeholder="votre.email@exemple.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6} // Supabase default minimum password length
                className="w-full p-3 border rounded-md dark:bg-be-csp-text/80 dark:border-be-csp-neutral/30 focus:ring-2 focus:ring-be-csp-primary focus:outline-none"
                placeholder="Minimum 6 caractères"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirmer le mot de passe</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 border rounded-md dark:bg-be-csp-text/80 dark:border-be-csp-neutral/30 focus:ring-2 focus:ring-be-csp-primary focus:outline-none"
                placeholder="Retapez votre mot de passe"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {successMessage && (
              <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Inscription en cours...' : 'S\inscrire'}
            </Button>
            <p className="text-sm text-center">
              Déjà un compte ?{' '}
              <a href="/auth/login" className="text-be-csp-primary hover:underline">
                Se connecter
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

