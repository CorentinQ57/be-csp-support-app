'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from 'next/link';
import { format } from 'date-fns';

// Interfaces
interface Category {
  id: number;
  name: string;
  description: string | null;
  // Add article count if fetched via RPC or separate query
  article_count?: number;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  created_at: string;
  category_id: number | null;
  // Joined data
  documentation_categories?: { name: string } | null;
}

export default function DocumentationPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articlesRecents, setArticlesRecents] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and recent articles on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoadingCategories(true);
      setLoadingArticles(true);
      setError(null);
      try {
        // Fetch categories (consider fetching article count separately or via RPC)
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('documentation_categories')
          .select('*')
          .order('name', { ascending: true });
        if (categoriesError) throw categoriesError;
        // TODO: Fetch article counts for each category if needed
        setCategories(categoriesData || []);
        setLoadingCategories(false);

        // Fetch recent articles (join with category name)
        const { data: articlesData, error: articlesError } = await supabase
          .from('documentation_articles')
          .select(`
            id, title, slug, created_at, category_id,
            documentation_categories ( name )
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        if (articlesError) throw articlesError;
        setArticlesRecents(articlesData || []);
        setLoadingArticles(false);

      } catch (err: any) {
        console.error("Error fetching documentation data:", err);
        setError(err.message || 'Erreur lors du chargement de la documentation.');
        setLoadingCategories(false);
        setLoadingArticles(false);
      }
    };
    fetchData();
  }, []);

  // Debounced search function
  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setLoadingSearch(false);
      return;
    }
    setLoadingSearch(true);
    setError(null);
    try {
      const { data, error: searchError } = await supabase
        .from('documentation_articles')
        .select(`
            id, title, slug, created_at, category_id,
            documentation_categories ( name )
          `)
        // Search in title and content (assuming content exists)
        .or(`title.ilike.%${term}%,content.ilike.%${term}%`) 
        .limit(10); // Limit search results

      if (searchError) throw searchError;
      setSearchResults(data || []);
    } catch (err: any) {
      console.error("Error searching documentation:", err);
      setError(err.message || 'Erreur lors de la recherche.');
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  }, []);

  // Use effect for debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      performSearch(searchTerm);
    }, 500); // Debounce time: 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, performSearch]);

  // Helper to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-be-csp-primary dark:text-white">Centre de Documentation</h1>
        <p className="text-be-csp-neutral dark:text-be-csp-neutral/80">Trouvez des réponses, des guides et des tutoriels.</p>
      </header>

      {/* Barre de recherche */} 
      <div className="mb-8 relative">
        <Input 
          type="text" 
          placeholder="Rechercher dans la documentation... (ex: configurer MFA, créer VM Azure)" 
          className="w-full p-4 border rounded-lg text-lg dark:bg-be-csp-text/80 dark:border-be-csp-neutral/30 focus:ring-2 focus:ring-be-csp-primary focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Search Results Dropdown */} 
        {(loadingSearch || searchResults.length > 0 || (searchTerm && !loadingSearch && searchResults.length === 0)) && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-be-csp-text border border-gray-300 dark:border-be-csp-neutral/30 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {loadingSearch && <div className="p-3 text-sm text-gray-500">Recherche en cours...</div>}
            {!loadingSearch && searchResults.length === 0 && searchTerm && (
              <div className="p-3 text-sm text-gray-500">Aucun résultat trouvé pour "{searchTerm}".</div>
            )}
            {!loadingSearch && searchResults.map((article) => (
              <Link 
                key={article.id} 
                href={`/documentation/${article.documentation_categories?.name || 'uncategorized'}/${article.slug}`}
                passHref
              >
                <div className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-be-csp-neutral/20 cursor-pointer">
                  {article.title}
                  {article.documentation_categories?.name && (
                    <span className="ml-2 text-xs text-gray-500">({article.documentation_categories.name})</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 mb-4">Erreur: {error}</p>}

      {/* Navigation par catégories */} 
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Explorer par catégorie</CardTitle>
          <CardDescription>Parcourez les ressources par sujet.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCategories ? <p>Chargement des catégories...</p> : categories.length === 0 ? <p>Aucune catégorie trouvée.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/documentation/${cat.name}`} // Link to category page (needs implementation)
                  passHref
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-be-csp-text/70 h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg text-be-csp-primary dark:text-white">{cat.name}</CardTitle>
                      {cat.description && <CardDescription>{cat.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="mt-auto">
                      {/* Display article count if available */}
                      {cat.article_count !== undefined && (
                         <p className="text-sm text-be-csp-neutral">{cat.article_count} article(s)</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Articles récents */} 
      <Card>
        <CardHeader>
          <CardTitle>Articles récents</CardTitle>
          <CardDescription>Les dernières ressources ajoutées à notre documentation.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingArticles ? <p>Chargement des articles...</p> : articlesRecents.length === 0 ? <p>Aucun article récent.</p> : (
            <div className="space-y-4">
              {articlesRecents.map((article) => (
                <Link 
                  key={article.id} 
                  href={`/documentation/${article.documentation_categories?.name || 'uncategorized'}/${article.slug}`}
                  passHref
                >
                  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer dark:border-be-csp-neutral/30 dark:bg-be-csp-text/70">
                    <h3 className="text-lg font-medium text-be-csp-primary dark:text-white mb-1">{article.title}</h3>
                    <div className="flex justify-between items-center text-sm text-be-csp-neutral">
                      <span>{article.documentation_categories?.name || 'Non classé'}</span>
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 