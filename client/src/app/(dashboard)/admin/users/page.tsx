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
import { usersApi, User } from '@/lib/api';
import { useAsync } from '@/lib/hooks';

// Define a mock user that matches our UI needs
interface UIUser {
  id: string;
  username: string;
  email: string;
  role: string;
  tenantName: string;
  isActive: boolean;
  lastLogin: string;
}

// Mock data for fallback
const mockUsers: UIUser[] = [
  {
    id: '1',
    username: 'superadmin',
    email: 'sracomconnect@gmail.com',
    role: 'SUPER_ADMIN',
    tenantName: 'N/A',
    isActive: true,
    lastLogin: '2025-03-20',
  },
  {
    id: '2',
    username: 'admin1',
    email: 'admin@tenant1.com',
    role: 'ADMIN',
    tenantName: 'Default Tenant',
    isActive: true,
    lastLogin: '2025-03-19',
  },
  {
    id: '3',
    username: 'manager1',
    email: 'manager@tenant1.com',
    role: 'TEAM_MANAGER',
    tenantName: 'Default Tenant',
    isActive: true,
    lastLogin: '2025-03-18',
  },
  {
    id: '4',
    username: 'employee1',
    email: 'employee@tenant1.com',
    role: 'EMPLOYEE',
    tenantName: 'Default Tenant',
    isActive: true,
    lastLogin: '2025-03-17',
  },
  {
    id: '5',
    username: 'admin2',
    email: 'admin@tenant2.com',
    role: 'ADMIN',
    tenantName: 'Second Tenant',
    isActive: true,
    lastLogin: '2025-03-16',
  },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UIUser[]>(mockUsers);
  
  // Use the useAsync hook to fetch users
  const { data: apiUsers, loading, error, execute: fetchUsers } = useAsync<unknown>(
    async () => {
      try {
        // Try to fetch from API
        return await usersApi.getAll();
      } catch (error) {
        console.error('Error fetching users from API:', error);
        // Return mock data if API fails
        return mockUsers;
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
    if (apiUsers && Array.isArray(apiUsers) && apiUsers.length > 0) {
      try {
        // Process API data
        const processedUsers = (apiUsers as User[]).map(user => {
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role?.name || 'N/A',
            tenantName: user.tenant?.name || 'N/A',
            isActive: user.isActive,
            lastLogin: user.lastLogin || 'Jamais'
          } as UIUser;
        });
        setUsers(processedUsers);
      } catch (error) {
        console.error('Error processing API data:', error);
        // Use mock data if processing fails
        setUsers(mockUsers);
      }
    } else {
      // Use mock data if API returns empty or invalid data
      setUsers(mockUsers);
    }
  }, [apiUsers]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <Button asChild>
          <Link href="/admin/users/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvel Utilisateur
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
          <CardDescription>
            Liste de tous les utilisateurs dans le système
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher par nom, email, rôle ou locataire..."
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
              <span className="ml-2">Chargement des utilisateurs...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              Une erreur est survenue lors du chargement des utilisateurs.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4"
                onClick={() => fetchUsers()}
              >
                Réessayer
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom d&apos;utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Locataire</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière Connexion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'SUPER_ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : user.role === 'ADMIN' 
                            ? 'bg-blue-100 text-blue-800' 
                            : user.role === 'TEAM_MANAGER' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>{user.tenantName}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell>{typeof user.lastLogin === 'string' ? formatDate(user.lastLogin) : user.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/users/edit/${user.id}`}>
                              Modifier
                            </Link>
                          </Button>
                          <DeleteDialog
                            title="Confirmer la suppression"
                            description={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.username}" ?`}
                            itemName={user.username}
                            onDelete={async () => {
                              try {
                                await usersApi.delete(user.id);
                                toast.success(`Utilisateur "${user.username}" supprimé avec succès`);
                                // Refresh the list
                                fetchUsers();
                              } catch (error) {
                                console.error(`Error deleting user with ID ${user.id}:`, error);
                                toast.error(`Erreur lors de la suppression de l'utilisateur "${user.username}"`);
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
