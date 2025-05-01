'use client';

import { useEffect, useState } from 'react';
import { env, validateEnv } from '@/lib/env';

export default function EnvCheck() {
  const [missingVars, setMissingVars] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    // Vérifier les variables d'environnement côté client
    const checkEnv = () => {
      const missing = [];
      
      if (!env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL === '') {
        missing.push('NEXT_PUBLIC_SUPABASE_URL');
      }
      
      if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY === '') {
        missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      }
      
      setMissingVars(missing);
      setShowWarning(missing.length > 0);
    };
    
    checkEnv();
  }, []);
  
  if (!showWarning) {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-100 p-4 text-yellow-800 z-50">
      <h2 className="font-bold text-lg">⚠️ Attention: Variables d'environnement manquantes</h2>
      <p>Les variables suivantes ne sont pas définies:</p>
      <ul className="list-disc pl-6">
        {missingVars.map(variable => (
          <li key={variable}>{variable}</li>
        ))}
      </ul>
      <p className="mt-2">
        Veuillez ajouter ces variables dans votre fichier .env.local ou dans les variables d'environnement de Vercel.
      </p>
      <button 
        className="mt-2 bg-yellow-200 hover:bg-yellow-300 px-3 py-1 rounded"
        onClick={() => setShowWarning(false)}
      >
        Fermer
      </button>
    </div>
  );
} 