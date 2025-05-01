
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Redirect to dashboard on successful login
      router.push('/dashboard'); 
      router.refresh(); // Refresh server components

    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-be-csp-neutral/10 dark:from-be-csp-text dark:to-black">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-be-csp-primary dark:text-white">Connexion</CardTitle>
          <CardDescription className="text-center">Accédez à votre espace BE-CSP Support</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
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
                className="w-full p-3 border rounded-md dark:bg-be-csp-text/80 dark:border-be-csp-neutral/30 focus:ring-2 focus:ring-be-csp-primary focus:outline-none"
                placeholder="********"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
            <p className="text-sm text-center">
              Pas encore de compte ?{' '}
              <a href="/auth/signup" className="text-be-csp-primary hover:underline">
                S'inscrire
              </a>
            </p>
            {/* Optionnel: Lien mot de passe oublié */}
            {/* <a href="/auth/forgot-password" className="text-sm text-center text-be-csp-primary hover:underline">
              Mot de passe oublié ?
            </a> */}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

