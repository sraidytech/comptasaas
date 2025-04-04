'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
import { PlusCircle, Search, Shield, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { rolesApi, Role } from '@/lib/api';
import { useAsync } from '@/lib/hooks';

// Define API error interface
interface ApiError {
  response?: {
    status?: number;
    data?: unknown;
  };
  message?: string;
}
import { DeleteDialog } from '@/components/ui/delete-dialog';

// Define a mock role that matches our UI needs
interface MockRole {
  id: string;
  name: string;
  description: string;
  permissionCount: string;
  createdAt: string;
  isSystem: boolean;
}

// Mock data for fallback
const mockRoles: MockRole[] = [
  {
    id: '1',
    name: 'SUPER_ADMIN',
    description: 'Accès complet au système',
    permissionCount: 'Toutes',
    createdAt: '2025-01-15T00:00:00.000Z',
    isSystem: true,
  },
  {
    id: '2',
    name: 'ADMIN',
    description: 'Accès complet à un locataire',
    permissionCount: '42',
    createdAt: '2025-01-15T00:00:00.000Z',
    isSystem: true,
  },
  {
    id: '3',
    name: 'TEAM_MANAGER',
    description: 'Gestion d\'une équipe',
    permissionCount: '28',
    createdAt: '2025-01-15T00:00:00.000Z',
    isSystem: true,
  },
  {
    id: '4',
    name: 'EMPLOYEE',
    description: 'Accès limité aux clients assignés',
    permissionCount: '15',
    createdAt: '2025-01-15T00:00:00.000Z',
    isSystem: true,
  },
  {
    id: '5',
    name: 'READ_ONLY_AUDITOR',
    description: 'Accès en lecture seule pour audit',
    permissionCount: '8',
    createdAt: '2025-02-10T00:00:00.000Z',
    isSystem: false,
  },
];

// UI representation of a role (used in the component)
type UIRole = MockRole;

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roles, setRoles] = useState<UIRole[]>(mockRoles);
  
  // Use the useAsync hook to fetch roles
  const { data: apiRoles, loading, error, execute: fetchRoles } = useAsync<unknown>(
    async () => {
      try {
        // Try to fetch from API
        return await rolesApi.getAll();
      } catch (error) {
        console.error('Error fetching roles from API:', error);
        // Return mock data if API fails
        return mockRoles;
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
    if (apiRoles && Array.isArray(apiRoles) && apiRoles.length > 0) {
      try {
        // Process API data
        const processedRoles = (apiRoles as Role[]).map(role => {
          return {
            id: role.id,
            name: role.name,
            description: role.description || '',
            permissionCount: role.permissions ? role.permissions.length.toString() : '0',
            createdAt: role.createdAt,
            isSystem: ['SUPER_ADMIN', 'ADMIN', 'TEAM_MANAGER', 'EMPLOYEE'].includes(role.name)
          } as UIRole;
        });
        setRoles(processedRoles);
      } catch (error) {
        console.error('Error processing API data:', error);
        // Use mock data if processing fails
        setRoles(mockRoles);
      }
    } else {
      // Use mock data if API returns empty or invalid data
      setRoles(mockRoles);
    }
  }, [apiRoles]);

  // Filter roles based on search term
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle role deletion
  const handleDeleteRole = async (role: UIRole) => {
    try {
      await rolesApi.delete(role.id);
      toast.success(`Rôle "${role.name}" supprimé avec succès`);
      // Refresh the list
      fetchRoles();
    } catch (error) {
      console.error(`Error deleting role with ID ${role.id}:`, error);
      const apiError = error as ApiError;
      if (apiError?.response?.status === 409) {
        toast.error(`Impossible de supprimer le rôle "${role.name}" car il est assigné à des utilisateurs`);
      } else {
        toast.error(`Erreur lors de la suppression du rôle "${role.name}"`);
      }
      throw error; // Re-throw to let the DeleteDialog handle it
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Rôles</h1>
        <Button asChild>
          <Link href="/admin/roles/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau Rôle
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rôles</CardTitle>
          <CardDescription>
            Liste de tous les rôles dans le système
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher par nom ou description..."
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
              <span className="ml-2">Chargement des rôles...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              Une erreur est survenue lors du chargement des rôles.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4"
                onClick={() => fetchRoles()}
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
                  <TableHead>Permissions</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date de Création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Aucun rôle trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className={`h-4 w-4 ${
                            role.name === 'SUPER_ADMIN' 
                              ? 'text-purple-500' 
                              : role.name === 'ADMIN' 
                              ? 'text-blue-500' 
                              : role.name === 'TEAM_MANAGER' 
                              ? 'text-green-500' 
                              : 'text-gray-500'
                          }`} />
                          {role.name}
                        </div>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>{role.permissionCount}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          role.isSystem ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {role.isSystem ? 'Système' : 'Personnalisé'}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(role.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/roles/edit/${role.id}`}>
                              Modifier
                            </Link>
                          </Button>
                          {!role.isSystem && (
                            <DeleteDialog 
                              title="Confirmer la suppression"
                              description={`Êtes-vous sûr de vouloir supprimer le rôle ${role.name} ?`}
                              itemName={role.name}
                              onDelete={() => handleDeleteRole(role)}
                            />
                          )}
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
