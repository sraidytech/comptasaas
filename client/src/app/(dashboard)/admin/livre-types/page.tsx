'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { livreTypesApi, LivreType } from '@/lib/api';
import { useAsync } from '@/lib/hooks';

// Define a mock livre type that matches our UI needs
interface MockLivreType {
  id: string;
  name: string;
  description: string;
  articles: string;
  months: number[];
  createdAt: string;
  updatedAt: string;
}

// Empty array for fallback
const mockLivreTypes: MockLivreType[] = [];

// UI representation of a livre type (used in the component)
type UILivreType = MockLivreType;

export default function LivreTypesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [livreTypes, setLivreTypes] = useState<UILivreType[]>(mockLivreTypes);
  
  // Use the useAsync hook to fetch livre types
  const { data: apiLivreTypes, loading, error, execute: fetchLivreTypes } = useAsync<unknown>(
    async () => {
      try {
        // Try to fetch from API
        return await livreTypesApi.getAll();
      } catch (error) {
        console.error('Error fetching livre types from API:', error);
        // Return mock data if API fails
        return mockLivreTypes;
      }
    },
    true // Fetch immediately
  );

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // When API data changes, update the state
  useEffect(() => {
    if (apiLivreTypes && Array.isArray(apiLivreTypes) && apiLivreTypes.length > 0) {
      try {
        // Process API data
        const processedTypes = (apiLivreTypes as LivreType[]).map(type => {
          // Extract months from the type's months array if it exists
          const months = type.months?.map(m => m.month) || [];
          return {
            ...type,
            months
          } as UILivreType;
        });
        setLivreTypes(processedTypes);
      } catch (error) {
        console.error('Error processing API data:', error);
        // Use mock data if processing fails
        setLivreTypes(mockLivreTypes);
      }
    } else {
      // Use mock data if API returns empty or invalid data
      setLivreTypes(mockLivreTypes);
    }
  }, [apiLivreTypes]);

  // Filter livre types based on search term
  const filteredLivreTypes = livreTypes.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (type.articles && type.articles.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Types de Livre</h1>
        <Button asChild>
          <Link href="/admin/livre-types/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau Type
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Types de Livre</CardTitle>
          <CardDescription>
            Liste de tous les types de livre dans le système
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher par nom, description ou articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des types de livre...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              Une erreur est survenue lors du chargement des types de livre.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4"
                onClick={() => fetchLivreTypes()}
              >
                Réessayer
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Mois</TableHead>
                  <TableHead>Date de Création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLivreTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Aucun type de livre trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLivreTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>{type.description}</TableCell>
                      <TableCell>{type.articles}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {type.months && type.months.map((month: number) => (
                            <span 
                              key={month} 
                              className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                            >
                              {new Date(2025, month - 1).toLocaleString('fr-FR', { month: 'short' })}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(type.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/livre-types/edit/${type.id}`}>
                              Modifier
                            </Link>
                          </Button>
                          <DeleteDialog
                            title="Confirmer la suppression"
                            description={`Êtes-vous sûr de vouloir supprimer le type de livre "${type.name}" ?`}
                            itemName={type.name}
                            onDelete={async () => {
                              try {
                                await livreTypesApi.delete(type.id);
                                toast.success(`Type de livre "${type.name}" supprimé avec succès`);
                                // Refresh the list
                                fetchLivreTypes();
                              } catch (error) {
                                console.error(`Error deleting livre type with ID ${type.id}:`, error);
                                toast.error(`Erreur lors de la suppression du type de livre "${type.name}"`);
                                throw error; // Rethrow to let DeleteDialog handle the error state
                              }
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
