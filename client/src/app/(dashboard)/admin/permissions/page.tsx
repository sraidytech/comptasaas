'use client';

import { useState, useEffect } from 'react';
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
import { Search, Lock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { permissionsApi, Permission, PermissionRole } from '@/lib/api';
import { useAsync } from '@/lib/hooks';

// Mock data for fallback
const mockPermissions = [
  {
    id: '1',
    name: 'user:create',
    description: 'Créer des utilisateurs',
    category: 'Gestion des Utilisateurs',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    id: '2',
    name: 'user:read',
    description: 'Voir les utilisateurs',
    category: 'Gestion des Utilisateurs',
    roles: ['SUPER_ADMIN', 'ADMIN', 'TEAM_MANAGER'],
  },
  {
    id: '3',
    name: 'user:update',
    description: 'Modifier des utilisateurs',
    category: 'Gestion des Utilisateurs',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    id: '4',
    name: 'user:delete',
    description: 'Supprimer des utilisateurs',
    category: 'Gestion des Utilisateurs',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    id: '5',
    name: 'client:create',
    description: 'Créer des clients',
    category: 'Gestion des Clients',
    roles: ['SUPER_ADMIN', 'ADMIN', 'TEAM_MANAGER'],
  },
  {
    id: '6',
    name: 'client:read',
    description: 'Voir les clients',
    category: 'Gestion des Clients',
    roles: ['SUPER_ADMIN', 'ADMIN', 'TEAM_MANAGER', 'EMPLOYEE', 'READ_ONLY_AUDITOR'],
  },
  {
    id: '7',
    name: 'client:update',
    description: 'Modifier des clients',
    category: 'Gestion des Clients',
    roles: ['SUPER_ADMIN', 'ADMIN', 'TEAM_MANAGER'],
  },
  {
    id: '8',
    name: 'client:delete',
    description: 'Supprimer des clients',
    category: 'Gestion des Clients',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    id: '9',
    name: 'client:assign',
    description: 'Assigner des clients aux utilisateurs',
    category: 'Gestion des Clients',
    roles: ['SUPER_ADMIN', 'ADMIN', 'TEAM_MANAGER'],
  },
];

// UI representation of a permission
interface UIPermission {
  id: string;
  name: string;
  description: string;
  category: string;
  roles: string[];
}

// Helper function to categorize permissions based on their name
const categorizePermission = (name: string): string => {
  if (name.startsWith('user:')) return 'Gestion des Utilisateurs';
  if (name.startsWith('client:')) return 'Gestion des Clients';
  if (name.startsWith('declaration:')) return 'Gestion des Déclarations';
  if (name.startsWith('livre:')) return 'Gestion des Livres';
  if (name.startsWith('task:')) return 'Gestion des Tâches';
  if (name.startsWith('report:')) return 'Rapports et Analyses';
  if (name.startsWith('system:')) return 'Configuration Système';
  return 'Autre';
};

const categories = [
  'Tous',
  'Gestion des Utilisateurs',
  'Gestion des Clients',
  'Gestion des Déclarations',
  'Gestion des Livres',
  'Gestion des Tâches',
  'Rapports et Analyses',
  'Configuration Système',
];

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [permissions, setPermissions] = useState<UIPermission[]>([]);
  
  // Use the useAsync hook to fetch permissions
  const { data: apiPermissions, loading, error, execute: fetchPermissions } = useAsync<Permission[]>(
    async () => {
      try {
        // Try to fetch from API
        return await permissionsApi.getAll();
      } catch (error) {
        console.error('Error fetching permissions from API:', error);
        // Return empty array if API fails
        return [];
      }
    },
    true // Fetch immediately
  );
  
  // When API data changes, update the state
  useEffect(() => {
    if (apiPermissions && Array.isArray(apiPermissions) && apiPermissions.length > 0) {
      try {
        // Process API data
        const processedPermissions = apiPermissions.map(permission => {
          // Extract role names from the roles array
          const roleNames = permission.roles?.map((role: PermissionRole) => role.name) || [];
          
          return {
            id: permission.id,
            name: permission.name,
            description: permission.description || 'No description',
            category: categorizePermission(permission.name),
            roles: roleNames,
          } as UIPermission;
        });
        setPermissions(processedPermissions);
      } catch (error) {
        console.error('Error processing API data:', error);
        // Use mock data if processing fails
        setPermissions(mockPermissions);
      }
    } else {
      // Use mock data if API returns empty or invalid data
      setPermissions(mockPermissions);
    }
  }, [apiPermissions]);
  
  const filteredPermissions = permissions.filter(permission => 
    (searchTerm === '' || 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (categoryFilter === 'Tous' || permission.category === categoryFilter)
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Permissions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            Liste de toutes les permissions dans le système
          </CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Catégorie:</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des permissions...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              Une erreur est survenue lors du chargement des permissions.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4"
                onClick={() => fetchPermissions()}
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
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Rôles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Aucune permission trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPermissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-gray-500" />
                          {permission.name}
                        </div>
                      </TableCell>
                      <TableCell>{permission.description}</TableCell>
                      <TableCell>{permission.category}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {permission.roles.map((role) => (
                            <span 
                              key={role} 
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                role === 'SUPER_ADMIN' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : role === 'ADMIN' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : role === 'TEAM_MANAGER' 
                                  ? 'bg-green-100 text-green-800' 
                                  : role === 'EMPLOYEE'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {role}
                            </span>
                          ))}
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
