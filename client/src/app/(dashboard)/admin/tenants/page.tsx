'use client';

import { useEffect, useState } from 'react';
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
import { PlusCircle, Loader2 } from 'lucide-react';
import { tenantsApi, Tenant } from '@/lib/api';
import { useAsync } from '@/lib/hooks';

// Extended tenant type with additional UI-specific properties
interface ExtendedTenant extends Tenant {
  userCount?: number;
  clientCount?: number;
}

// Mock data for development until API is ready
const MOCK_TENANTS: ExtendedTenant[] = [
  {
    id: '1',
    name: 'Default Tenant',
    description: 'Default tenant for testing',
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z',
    userCount: 3,
    clientCount: 5,
  },
  {
    id: '2',
    name: 'Second Tenant',
    description: 'Second tenant for testing multi-tenant functionality',
    createdAt: '2025-01-20T00:00:00.000Z',
    updatedAt: '2025-01-20T00:00:00.000Z',
    userCount: 1,
    clientCount: 2,
  },
];

export default function TenantsPage() {

  // State for extended tenants with user and client counts
  const [extendedTenants, setExtendedTenants] = useState<ExtendedTenant[]>(MOCK_TENANTS);
  
  // Use the useAsync hook to fetch tenants
  const { data: apiTenants, loading, error, execute: fetchTenants } = useAsync<Tenant[]>(
    async () => {
      try {
        // Try to fetch from API
        return await tenantsApi.getAll();
      } catch (error) {
        console.error('Error fetching tenants from API:', error);
        // Return mock data if API fails
        return MOCK_TENANTS;
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

  // When tenants data changes, update the extended tenants
  useEffect(() => {
    if (apiTenants && Array.isArray(apiTenants) && apiTenants.length > 0) {
      // Use the actual counts from the API
      const extended = apiTenants.map(tenant => ({
        ...tenant,
        userCount: tenant._count?.users || 0,
        clientCount: tenant._count?.clients || 0,
      }));
      setExtendedTenants(extended);
    } else {
      // Use mock data if API returns empty or invalid data
      setExtendedTenants(MOCK_TENANTS);
    }
  }, [apiTenants]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Locataires</h1>
        <Button asChild>
          <Link href="/admin/tenants/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau Locataire
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Locataires</CardTitle>
          <CardDescription>
            Liste de tous les locataires dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des locataires...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              Une erreur est survenue lors du chargement des locataires.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4"
                onClick={() => fetchTenants()}
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
                  <TableHead className="text-right">Utilisateurs</TableHead>
                  <TableHead className="text-right">Clients</TableHead>
                  <TableHead>Date de Création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extendedTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Aucun locataire trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  extendedTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>{tenant.description}</TableCell>
                      <TableCell className="text-right">{tenant.userCount}</TableCell>
                      <TableCell className="text-right">{tenant.clientCount}</TableCell>
                      <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/tenants/edit/${tenant.id}`}>
                              Modifier
                            </Link>
                          </Button>
                          <DeleteDialog
                            title="Confirmer la suppression"
                            description={`Êtes-vous sûr de vouloir supprimer le locataire "${tenant.name}" ?`}
                            itemName={tenant.name}
                            onDelete={async () => {
                              try {
                                await tenantsApi.delete(tenant.id);
                                toast.success(`Locataire "${tenant.name}" supprimé avec succès`);
                                // Refresh the list
                                fetchTenants();
                              } catch (error) {
                                console.error(`Error deleting tenant with ID ${tenant.id}:`, error);
                                toast.error(`Erreur lors de la suppression du locataire "${tenant.name}"`);
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
