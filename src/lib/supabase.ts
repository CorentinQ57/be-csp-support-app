import { createClient } from '@supabase/supabase-js'
import { env } from './env'

// Vérification des variables d'environnement Supabase
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  if (typeof window !== 'undefined') {
    // Afficher un message d'erreur uniquement côté client
    console.error('Veuillez configurer les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
}

// Création du client Supabase avec des valeurs par défaut vides si nécessaire
// Cela permet d'éviter les erreurs au build, mais l'application affichera un avertissement
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.com',
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key'
)

// Fonction utilitaire pour créer un client avec le rôle de service
export const createServiceClient = () => {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ Variable d\'environnement SUPABASE_SERVICE_ROLE_KEY manquante')
    return null
  }
  
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
} 