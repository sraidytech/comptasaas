'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  PlusCircle, 
  Search, 
  Loader2, 
  ChevronUp, 
  ChevronDown, 
  Filter,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usersApi, User, FilterUsersDto, PaginatedUsersResponse, tenantsApi, Tenant, rolesApi, Role } from '@/lib/api';
import { useAsync } from '@/lib/hooks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// User interface with details from API
interface UIUser {
  id: string;
  username: string;
  email: string;
  role: string;
  roleId: string;
  tenantName: string;
  tenantId: string | null;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UIUser[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // State for status change dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UIUser | null>(null);
  const [newStatus, setNewStatus] = useState(false);
  
  // State for filtering and sorting
  const [filters, setFilters] = useState<FilterUsersDto>({
    search: '',
    page: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  
  // State for showing filter panel
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch tenants for filtering
  const { data: apiTenants } = useAsync<Tenant[]>(
    async () => {
      try {
        return await tenantsApi.getAll();
      } catch (error) {
        console.error('Error fetching tenants:', error);
        return [];
      }
    },
    true // Fetch immediately
  );
  
  // Fetch roles for filtering
  const { data: apiRoles } = useAsync<Role[]>(
    async () => {
      try {
        return await rolesApi.getAll();
      } catch (error) {
        console.error('Error fetching roles:', error);
        return [];
      }
    },
    true // Fetch immediately
  );
  
  // Update tenants and roles when API data is loaded
  useEffect(() => {
    if (apiTenants && Array.isArray(apiTenants)) {
      setTenants(apiTenants);
    }
  }, [apiTenants]);
  
  useEffect(() => {
    if (apiRoles && Array.isArray(apiRoles)) {
      setRoles(apiRoles);
    }
  }, [apiRoles]);
  
  // Memoize the async function to prevent it from being recreated on every render
  const fetchUsersAsync = useCallback(async () => {
    try {
      // Fetch from API with filters
      return await usersApi.getAll(filters);
    } catch (error) {
      console.error('Error fetching users from API:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
      return {
        users: [],
        total: 0,
        page: 0,
        pageSize: 10,
        totalPages: 0,
      };
    }
  }, [filters]); // Only recreate when filters change
  
  // Use the useAsync hook with the memoized async function
  const { data: apiUsers, loading, error, execute } = useAsync<unknown>(
    fetchUsersAsync,
    true // Fetch immediately
  );
  
  // Memoize the fetchUsers function to prevent infinite loops
  const fetchUsers = useCallback(() => {
    execute();
  }, [execute]);
  
  // Use a ref to track if this is the first render
  const isFirstRender = useRef(true);
  
  // Refetch when filters change, but not on first render
  useEffect(() => {
    // Skip the first render to avoid double fetching
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Call fetchUsers when filters change
    fetchUsers();
  }, [filters, fetchUsers]);
  
  // Handle changing user status
  const handleChangeStatus = async () => {
    if (!selectedUser) return;
    
    try {
      await usersApi.setActiveStatus(selectedUser.id, newStatus);
      toast.success(`Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`);
      fetchUsers(); // Refresh the list
      setStatusDialogOpen(false);
    } catch (error) {
      console.error('Error changing user status:', error);
      toast.error(`Erreur lors du changement de statut de l'utilisateur`);
    }
  };
  
  // Open status change dialog
  const openStatusDialog = (user: UIUser, status: boolean) => {
    setSelectedUser(user);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  // Format date to a readable format
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Jamais';
    
    try {
      // Check if the date is valid
      // Try to handle ISO string or any other valid date format
      let date: Date;
      
      // If it's already a valid ISO string, use it directly
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateString)) {
        date = new Date(dateString);
      } else {
        // Try to parse other date formats
        // Split by common separators and try to construct a valid date
        const parts = dateString.split(/[-/.: ]/g).filter(Boolean);
        if (parts.length >= 3) {
          // Assume year, month, day format if we have at least 3 parts
          const year = parseInt(parts[0].length === 4 ? parts[0] : parts[2]);
          const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
          const day = parseInt(parts[0].length === 4 ? parts[2] : parts[0]);
          
          date = new Date(year, month, day);
          
          // Add time if available
          if (parts.length >= 6) {
            date.setHours(parseInt(parts[3]));
            date.setMinutes(parseInt(parts[4]));
            date.setSeconds(parseInt(parts[5]));
          }
        } else {
          // If we can't parse it, try the default Date constructor
          date = new Date(dateString);
        }
      }
      
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date format: ${dateString}`);
        return 'Date invalide';
      }
      
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Date invalide';
    }
  };

  // Process API data
  useEffect(() => {
    if (apiUsers) {
      try {
        if (apiUsers && typeof apiUsers === 'object' && 'users' in apiUsers && Array.isArray((apiUsers as Record<string, unknown>).users)) {
          // Handle paginated response
          const paginatedResponse = apiUsers as PaginatedUsersResponse;
          const processedUsers = paginatedResponse.users.map(user => {
            return {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role?.name || 'N/A',
              roleId: user.roleId,
              tenantName: user.tenant?.name || 'N/A',
              tenantId: user.tenantId || null,
              isActive: user.isActive,
              lastLogin: user.lastLogin || 'Jamais',
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            } as UIUser;
          });
          setUsers(processedUsers);
          setTotalUsers(paginatedResponse.total);
          setTotalPages(paginatedResponse.totalPages);
        } else if (Array.isArray(apiUsers)) {
          // Handle array response (backward compatibility)
          const processedUsers = (apiUsers as User[]).map(user => {
            return {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role?.name || 'N/A',
              roleId: user.roleId,
              tenantName: user.tenant?.name || 'N/A',
              tenantId: user.tenantId || null,
              isActive: user.isActive,
              lastLogin: user.lastLogin || 'Jamais',
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            } as UIUser;
          });
          setUsers(processedUsers);
          setTotalUsers(processedUsers.length);
          setTotalPages(1);
        } else {
          // Empty array if API returns invalid data
          setUsers([]);
          setTotalUsers(0);
          setTotalPages(0);
        }
      } catch (error) {
        console.error('Error processing API data:', error);
        // Empty array if processing fails
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(0);
      }
    } else {
      // Empty array if API returns empty data
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(0);
    }
  }, [apiUsers]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilters((prev: FilterUsersDto) => ({ ...prev, search: value, page: 0 })); // Reset to first page on search
  };
  
  // Handle sort column click
  const handleSort = (column: string) => {
    setFilters((prev: FilterUsersDto) => ({
      ...prev,
      sortBy: column,
      sortDirection: prev.sortBy === column && prev.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  // Handle tenant filter change
  const handleTenantFilterChange = (value: string) => {
    setFilters((prev: FilterUsersDto) => ({ 
      ...prev, 
      tenantId: value === 'all' ? undefined : value, 
      page: 0 
    }));
  };
  
  // Handle role filter change
  const handleRoleFilterChange = (value: string) => {
    setFilters((prev: FilterUsersDto) => ({ 
      ...prev, 
      roleId: value === 'all' ? undefined : value, 
      page: 0 
    }));
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setFilters((prev: FilterUsersDto) => ({ 
      ...prev, 
      isActive: value === 'all' ? undefined : value === 'true', 
      page: 0 
    }));
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setFilters((prev: FilterUsersDto) => ({ ...prev, page: newPage }));
  };

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
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher par nom, email, rôle ou locataire..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="max-w-sm"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="ml-2"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <Select
                    value={filters.isActive === undefined ? '' : String(filters.isActive)}
                    onValueChange={handleStatusFilterChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="true">Actif</SelectItem>
                      <SelectItem value="false">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Locataire</label>
                  <Select
                    value={filters.tenantId || ''}
                    onValueChange={handleTenantFilterChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les locataires" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les locataires</SelectItem>
                      {tenants.map(tenant => (
                        <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Rôle</label>
                  <Select
                    value={filters.roleId || ''}
                    onValueChange={handleRoleFilterChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les rôles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rôles</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Trier par</label>
                  <Select
                    value={filters.sortBy || 'createdAt'}
                    onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Date de création" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="username">Nom d&apos;utilisateur</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="createdAt">Date de création</SelectItem>
                      <SelectItem value="lastLogin">Dernière connexion</SelectItem>
                      <SelectItem value="role.name">Rôle</SelectItem>
                      <SelectItem value="tenant.name">Locataire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Direction</label>
                  <Select
                    value={filters.sortDirection || 'desc'}
                    onValueChange={(value) => 
                      setFilters({ ...filters, sortDirection: value as 'asc' | 'desc' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Descendant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascendant</SelectItem>
                      <SelectItem value="desc">Descendant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
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
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('username')}
                  >
                    Nom d&apos;utilisateur
                    {filters.sortBy === 'username' && (
                      filters.sortDirection === 'asc' ? 
                        <ChevronUp className="inline ml-1 h-4 w-4" /> : 
                        <ChevronDown className="inline ml-1 h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    {filters.sortBy === 'email' && (
                      filters.sortDirection === 'asc' ? 
                        <ChevronUp className="inline ml-1 h-4 w-4" /> : 
                        <ChevronDown className="inline ml-1 h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('role.name')}
                  >
                    Rôle
                    {filters.sortBy === 'role.name' && (
                      filters.sortDirection === 'asc' ? 
                        <ChevronUp className="inline ml-1 h-4 w-4" /> : 
                        <ChevronDown className="inline ml-1 h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('tenant.name')}
                  >
                    Locataire
                    {filters.sortBy === 'tenant.name' && (
                      filters.sortDirection === 'asc' ? 
                        <ChevronUp className="inline ml-1 h-4 w-4" /> : 
                        <ChevronDown className="inline ml-1 h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('lastLogin')}
                  >
                    Dernière Connexion
                    {filters.sortBy === 'lastLogin' && (
                      filters.sortDirection === 'asc' ? 
                        <ChevronUp className="inline ml-1 h-4 w-4" /> : 
                        <ChevronDown className="inline ml-1 h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
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
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </span>
                          {user.role !== 'SUPER_ADMIN' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openStatusDialog(user, !user.isActive)}
                              title={user.isActive ? 'Désactiver' : 'Activer'}
                            >
                              {user.isActive ? (
                                <UserX className="h-4 w-4 text-red-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{typeof user.lastLogin === 'string' ? formatDate(user.lastLogin) : user.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/users/edit/${user.id}`}>
                              Modifier
                            </Link>
                          </Button>
                          {user.role !== 'SUPER_ADMIN' && (
                            <DeleteDialog
                              title="Confirmer la suppression"
                              description={`Êtes-vous sûr de vouloir supprimer l&apos;utilisateur "${user.username}" ?`}
                              itemName={user.username}
                              onDelete={async () => {
                                try {
                                  await usersApi.delete(user.id);
                                  toast.success(`Utilisateur "${user.username}" supprimé avec succès`);
                                  // Refresh the list
                                  fetchUsers();
                                } catch (error) {
                                  console.error(`Error deleting user with ID ${user.id}:`, error);
                                  toast.error(`Erreur lors de la suppression de l&apos;utilisateur "${user.username}"`);
                                  throw error; // Rethrow to let DeleteDialog handle the error state
                                }
                              }}
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <CardFooter className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Affichage de {users.length} utilisateurs sur {totalUsers} au total
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(0, (filters.page || 0) - 1))}
                disabled={(filters.page || 0) === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <span className="text-sm">
                Page {(filters.page || 0) + 1} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages - 1, (filters.page || 0) + 1))}
                disabled={(filters.page || 0) >= totalPages - 1}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Status change dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newStatus ? 'Activer' : 'Désactiver'} l&apos;utilisateur
            </DialogTitle>
            <DialogDescription>
              {newStatus 
                ? "L'activation de cet utilisateur lui permettra de se connecter à l'application."
                : "La désactivation de cet utilisateur l'empêchera de se connecter à l'application."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            Êtes-vous sûr de vouloir {newStatus ? 'activer' : 'désactiver'} l&apos;utilisateur 
            <span className="font-bold"> {selectedUser?.username}</span> ?
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant={newStatus ? 'default' : 'destructive'} 
              onClick={handleChangeStatus}
            >
              {newStatus ? 'Activer' : 'Désactiver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
