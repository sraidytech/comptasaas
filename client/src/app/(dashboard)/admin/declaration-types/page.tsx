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
import { declarationTypesApi, DeclarationType } from '@/lib/api';
import { useAsync } from '@/lib/hooks';

// Define a mock declaration type that matches our UI needs
interface MockDeclarationType {
  id: string;
  name: string;
  description: string;
  articles: string;
  months: number[];
  createdAt: string;
  updatedAt: string;
}

// Empty array for fallback
const mockDeclarationTypes: MockDeclarationType[] = [];

// UI representation of a declaration type (used in the component)
type UIDeclarationType = MockDeclarationType;

export default function DeclarationTypesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [declarationTypes, setDeclarationTypes] = useState<UIDeclarationType[]>(mockDeclarationTypes);
  
  // Use the useAsync hook to fetch declaration types
  const { data: apiDeclarationTypes, loading, error, execute: fetchDeclarationTypes } = useAsync<unknown>(
    async () => {
      try {
        // Try to fetch from API
        return await declarationTypesApi.getAll();
      } catch (error) {
        console.error('Error fetching declaration types from API:', error);
        // Return mock data if API fails
        return mockDeclarationTypes;
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
    if (apiDeclarationTypes && Array.isArray(apiDeclarationTypes) && apiDeclarationTypes.length > 0) {
      try {
        // Process API data
        const processedTypes = (apiDeclarationTypes as DeclarationType[]).map(type => {
          // Extract months from the type's declarationMonths array if it exists
          console.log('Processing declaration type:', type);
          console.log('Months data:', type.declarationMonths);
          
          const months = type.declarationMonths?.map(m => m.month) || [];
          console.log('Extracted months:', months);
          
          return {
            ...type,
            months
          } as UIDeclarationType;
        });
        console.log('Processed declaration types:', processedTypes);
        setDeclarationTypes(processedTypes);
      } catch (error) {
        console.error('Error processing API data:', error);
        // Use mock data if processing fails
        setDeclarationTypes(mockDeclarationTypes);
      }
    } else {
      // Use mock data if API returns empty or invalid data
      setDeclarationTypes(mockDeclarationTypes);
    }
  }, [apiDeclarationTypes]);

  // Filter declaration types based on search term
  const filteredDeclarationTypes = declarationTypes.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (type.articles && type.articles.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Types de Déclaration</h1>
        <Button asChild>
          <Link href="/admin/declaration-types/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau Type
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Types de Déclaration</CardTitle>
          <CardDescription>
            Liste de tous les types de déclaration dans le système
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
              <span className="ml-2">Chargement des types de déclaration...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              Une erreur est survenue lors du chargement des types de déclaration.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4"
                onClick={() => fetchDeclarationTypes()}
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
                {filteredDeclarationTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Aucun type de déclaration trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeclarationTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>{type.description}</TableCell>
                      <TableCell>{type.articles}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {type.months && Array.isArray(type.months) && type.months.length > 0 ? (
                            type.months.map((month: number) => (
                              <span 
                                key={month} 
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                              >
                                {new Date(2025, month - 1).toLocaleString('fr-FR', { month: 'short' })}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400">Aucun mois</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(type.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/declaration-types/edit/${type.id}`}>
                              Modifier
                            </Link>
                          </Button>
                          <DeleteDialog
                            title="Confirmer la suppression"
                            description={`Êtes-vous sûr de vouloir supprimer le type de déclaration "${type.name}" ?`}
                            itemName={type.name}
                            onDelete={async () => {
                              try {
                                await declarationTypesApi.delete(type.id);
                                toast.success(`Type de déclaration "${type.name}" supprimé avec succès`);
                                // Refresh the list
                                fetchDeclarationTypes();
                              } catch (error) {
                                console.error(`Error deleting declaration type with ID ${type.id}:`, error);
                                toast.error(`Erreur lors de la suppression du type de déclaration "${type.name}"`);
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
