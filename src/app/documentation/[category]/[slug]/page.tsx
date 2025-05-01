
// Use client for hooks, but consider Server Components for initial data fetching if possible
// For simplicity with feedback interaction, we keep it client-side for now.
// Alternatively, use Server Actions for feedback.

// TODO: Explore using Server Components + Server Actions for better performance

// pages/documentation/[category]/[slug]/page.tsx

// Use client for hooks like useState, useEffect
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext"; // To get user for feedback
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { format } from "date-fns";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Interfaces
interface Article {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  author_user_id: string | null;
  category_id: number | null;
  // Joined data
  documentation_categories?: { name: string } | null;
  profiles?: { full_name: string } | null; // Author profile
}

interface TocItem {
  id: string;
  title: string;
  level: number;
}

// Helper function to generate TOC (consider a more robust Markdown parser like marked or react-markdown)
const generateToc = (content: string | null): TocItem[] => {
  if (!content) return [];
  // Basic regex for h2, h3, h4 - might need improvement for complex HTML/Markdown
  const headings = content.match(/<h([2-4])[^>]*>(.*?)<\/h\1>/gi) || [];
  return headings.map((heading) => {
    const level = parseInt(heading.charAt(2));
    const title = heading.replace(/<[^>]+>/g, "").trim();
    // Simple slugification for ID
    const id = title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return {
      id,
      title,
      level,
    };
  });
};

// Helper function to add IDs to headings (basic)
const addIdsToHeadings = (content: string | null): string => {
  if (!content) return "";
  return content.replace(
    /<h([2-4])([^>]*)>(.*?)<\/h\1>/gi,
    (match, level, attrs, title) => {
      const id = title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      // Avoid adding duplicate IDs if they already exist
      if (attrs && attrs.includes("id=")) {
        return match;
      }
      return `<h${level}${attrs ? attrs : ""} id="${id}">${title}</h${level}>`;
    }
  );
};

function ArticleContent({ params }: { params: { category: string; slug: string } }) {
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<boolean | null>(null); // null: not sent, true: yes, false: no
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const categorySlug = decodeURIComponent(params.category);
  const articleSlug = params.slug;

  const fetchArticle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("documentation_articles")
        .select(`
          *,
          documentation_categories ( name ),
          profiles ( full_name )
        `)
        .eq("slug", articleSlug)
        // Optionally filter by category slug if needed for uniqueness, though slug should be unique
        // .eq("documentation_categories.name", categorySlug)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          throw new Error("Article non trouvé.");
        } else {
          throw fetchError;
        }
      }
      setArticle(data);
    } catch (err: any) {
      console.error("Error fetching article:", err);
      setError(err.message || "Erreur lors du chargement de l\'article.");
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }, [articleSlug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleFeedback = async (wasHelpful: boolean) => {
    if (!user || !article || feedbackSent !== null || isSubmittingFeedback) return;

    setIsSubmittingFeedback(true);
    try {
      const { error: feedbackError } = await supabase
        .from("article_feedback")
        .insert({
          article_id: article.id,
          user_id: user.id,
          rating: wasHelpful ? 5 : 1, // Simple mapping: Yes=5, No=1
          // Add comment field if needed later
        });

      if (feedbackError) throw feedbackError;

      setFeedbackSent(wasHelpful);
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      // Optionally show an error message to the user
      alert("Erreur lors de l\envoi du feedback.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Memoize TOC generation and content enrichment
  const enrichedContent = useMemo(() => addIdsToHeadings(article?.content), [article?.content]);
  const toc = useMemo(() => generateToc(enrichedContent), [enrichedContent]);

  if (loading) {
    return <div className="container mx-auto p-6 text-center">Chargement de l\'article...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-6 text-center text-red-500">Erreur: {error}</div>;
  }

  if (!article) {
    return <div className="container mx-auto p-6 text-center">Article non trouvé.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-be-csp-neutral/10 dark:from-be-csp-text dark:to-black">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <div className="text-sm text-be-csp-neutral mb-2">
            <Link href="/documentation" className="hover:underline">Documentation</Link> / 
            {article.documentation_categories?.name && (
              <Link 
                href={`/documentation/${encodeURIComponent(article.documentation_categories.name)}`} 
                className="hover:underline"
              >
                {article.documentation_categories.name}
              </Link>
            )}
          </div>
          <h1 className="text-4xl font-bold text-be-csp-primary dark:text-white mb-2">{article.title}</h1>
          <p className="text-be-csp-neutral dark:text-be-csp-neutral/80">
            Publié le {format(new Date(article.created_at), "dd/MM/yyyy")} 
            {article.profiles?.full_name && ` par ${article.profiles.full_name}`}
            {article.updated_at !== article.created_at && 
              ` (Mis à jour le ${format(new Date(article.updated_at), "dd/MM/yyyy")})`
            }
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Contenu de l\'article */} 
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="prose dark:prose-invert max-w-none pt-6">
                {/* Render HTML content - Ensure content is sanitized if coming from untrusted sources */}
                {enrichedContent ? (
                  <div dangerouslySetInnerHTML={{ __html: enrichedContent }} />
                ) : (
                  <p>Contenu non disponible.</p>
                )}
              </CardContent>
              {/* Feedback Section */} 
              <CardFooter className="mt-6 pt-6 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="text-sm font-medium mb-2">Cet article vous a-t-il été utile ?</p>
                  {feedbackSent === null ? (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleFeedback(true)} 
                        disabled={isSubmittingFeedback}
                      >
                        {isSubmittingFeedback ? "Envoi..." : "👍 Oui"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleFeedback(false)} 
                        disabled={isSubmittingFeedback}
                      >
                        {isSubmittingFeedback ? "Envoi..." : "👎 Non"}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600 dark:text-green-400">Merci pour votre retour !</p>
                  )}
                </div>
                {/* Report issue button (optional) */}
                {/* <Button variant="outline" size="sm" className="mt-4 sm:mt-0">Signaler un problème</Button> */} 
              </CardFooter>
            </Card>
          </div>

          {/* Table des matières */} 
          {toc.length > 0 && (
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Table des matières</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {toc.map((item) => (
                      <li key={item.id} style={{ marginLeft: `${(item.level - 2) * 1}rem` }}>
                        <a 
                          href={`#${item.id}`} 
                          className="text-sm hover:text-be-csp-primary dark:hover:text-be-csp-accent transition-colors"
                          // Basic smooth scroll
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap with ProtectedRoute
export default function ArticlePageWithAuth({ params }: { params: { category: string; slug: string } }) {
  return (
    <ProtectedRoute>
      <ArticleContent params={params} />
    </ProtectedRoute>
  );
}

