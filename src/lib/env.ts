// Fichier de gestion des variables d'environnement avec valeurs par défaut si non définies

// Utilisation de la syntaxe de Next.js pour les variables d'environnement
// https://nextjs.org/docs/basic-features/environment-variables
export const env = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Next.js
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  
  // Fonctions utilitaires
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
};

// Vérifie si les variables essentielles sont définies
export function validateEnv() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar as keyof typeof process.env]
  );
  
  if (missingEnvVars.length > 0) {
    console.warn(
      `⚠️ Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`
    );
    if (env.isProduction) {
      console.warn('⚠️ En production, ces variables sont généralement requises.');
    }
  }

  return missingEnvVars.length === 0;
}

// Exécuter la validation lorsque ce module est importé
validateEnv(); 