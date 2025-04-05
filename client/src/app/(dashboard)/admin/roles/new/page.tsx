'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { rolesApi, CreateRoleDto, Permission } from '@/lib/api';
import { useAsync, useApiError } from '@/lib/hooks';

// Define a permission category for UI organization
interface PermissionCategory {
  id: string;
  name: string;
  permissions: Permission[];
}

// Mock permission categories for initial UI rendering
const mockPermissionCategories: PermissionCategory[] = [
  {
    id: '1',
    name: 'Gestion des Utilisateurs',
    permissions: [
      { id: '1', name: 'user:create', description: 'Créer des utilisateurs', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', name: 'user:read', description: 'Voir les utilisateurs', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '3', name: 'user:update', description: 'Modifier des utilisateurs', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '4', name: 'user:delete', description: 'Supprimer des utilisateurs', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
  },
  {
    id: '2',
    name: 'Gestion des Clients',
    permissions: [
      { id: '5', name: 'client:create', description: 'Créer des clients', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '6', name: 'client:read', description: 'Voir les clients', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '7', name: 'client:update', description: 'Modifier des clients', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '8', name: 'client:delete', description: 'Supprimer des clients', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '9', name: 'client:assign', description: 'Assigner des clients aux utilisateurs', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
  },
  {
    id: '3',
    name: 'Gestion des Déclarations',
    permissions: [
      { id: '10', name: 'declaration:create', description: 'Créer des déclarations', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '11', name: 'declaration:read', description: 'Voir les déclarations', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '12', name: 'declaration:update', description: 'Modifier des déclarations', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '13', name: 'declaration:delete', description: 'Supprimer des déclarations', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '14', name: 'declaration:submit', description: 'Soumettre des déclarations', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '15', name: 'declaration:approve', description: 'Approuver des déclarations', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
  },
  {
    id: '4',
    name: 'Gestion des Livres',
    permissions: [
      { id: '16', name: 'livre:create', description: 'Créer des livres', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '17', name: 'livre:read', description: 'Voir les livres', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '18', name: 'livre:update', description: 'Modifier des livres', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '19', name: 'livre:delete', description: 'Supprimer des livres', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '20', name: 'livre:submit', description: 'Soumettre des livres', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '21', name: 'livre:approve', description: 'Approuver des livres', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
  },
];

export default function NewRolePage() {
  const router = useRouter();
  const { getFieldError, hasFieldError, clearError } = useApiError();
  
  // State for permission categories
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>(mockPermissionCategories);
  
  // Form state
  const [formData, setFormData] = useState<CreateRoleDto>({
    name: '',
    description: '',
    permissionIds: [],
  });
  
  // UI state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  // Fetch permissions from API
  const { data: apiPermissions, loading: loadingPermissions } = useAsync<Permission[]>(
    async () => {
      try {
        return await rolesApi.getAllPermissions();
      } catch (error) {
        console.error('Error fetching permissions:', error);
        // Return empty array if API fails
        return [];
      }
    },
    true // Fetch immediately
  );
  
  // Create role
  const { loading, execute: createRole } = useAsync<unknown>(
    async (data: unknown) => {
      try {
        return await rolesApi.create(data as CreateRoleDto);
      } catch (error) {
        console.error('Error creating role:', error);
        throw error;
      }
    }
  );
  
  // Process API permissions into categories when they load
  useEffect(() => {
    if (apiPermissions && apiPermissions.length > 0) {
      // Group permissions by category
      const permissionsByCategory: Record<string, Permission[]> = {};
      
      apiPermissions.forEach(permission => {
        const category = permission.category || 'Autres';
        if (!permissionsByCategory[category]) {
          permissionsByCategory[category] = [];
        }
        permissionsByCategory[category].push(permission);
      });
      
      // Convert to array of categories
      const categories: PermissionCategory[] = Object.entries(permissionsByCategory).map(
        ([name, permissions], index) => ({
          id: `category-${index}`,
          name,
          permissions,
        })
      );
      
      setPermissionCategories(categories);
    }
  }, [apiPermissions]);
  
  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    // Clear validation error for this field
    if (validationErrors[id]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
    
    // Clear API error
    clearError();
  };
  
  // Toggle permission selection
  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds?.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...(prev.permissionIds || []), permissionId]
    }));
    
    // Clear permissions validation error if any permissions are selected
    if (validationErrors.permissions) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.permissions;
        return newErrors;
      });
    }
  };
  
  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  // Select all permissions in a category
  const selectAllInCategory = (categoryId: string) => {
    const category = permissionCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    const categoryPermissionIds = category.permissions.map(p => p.id);
    
    setFormData(prev => {
      const currentPermissionIds = prev.permissionIds || [];
      const newPermissionIds = [...currentPermissionIds];
      
      categoryPermissionIds.forEach(id => {
        if (!newPermissionIds.includes(id)) {
          newPermissionIds.push(id);
        }
      });
      
      return {
        ...prev,
        permissionIds: newPermissionIds
      };
    });
    
    // Clear permissions validation error
    if (validationErrors.permissions) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.permissions;
        return newErrors;
      });
    }
  };
  
  // Deselect all permissions in a category
  const deselectAllInCategory = (categoryId: string) => {
    const category = permissionCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    const categoryPermissionIds = category.permissions.map(p => p.id);
    
    setFormData(prev => ({
      ...prev,
      permissionIds: (prev.permissionIds || []).filter(id => !categoryPermissionIds.includes(id))
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.description?.trim()) newErrors.description = 'La description est requise';
    if (!formData.permissionIds?.length) newErrors.permissions = 'Au moins une permission doit être sélectionnée';
    
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      // Log the form data being sent
      console.log('Submitting role with data:', JSON.stringify(formData, null, 2));
      console.log('permissionIds type:', typeof formData.permissionIds);
      console.log('permissionIds value:', formData.permissionIds);
      console.log('permissionIds length:', formData.permissionIds?.length);
      
      // Submit form
      const result = await createRole(formData);
      
      if (result) {
        toast.success('Rôle créé avec succès');
        
        // Log the created role
        console.log('Role created:', JSON.stringify(result, null, 2));
        
        // Navigate back to roles list
        router.push('/admin/roles');
      } else {
        // If API returns null but doesn't throw an error
        console.warn('API returned null result but did not throw an error');
        toast.error('Erreur lors de la création du rôle');
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      
      // Check if it's an Axios error with response data
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number, data?: unknown } };
        
        // If the error is a 500 error, it might be due to the permissions assignment
        // The role might still have been created successfully
        if (axiosError.response?.status === 500) {
          toast.warning('Le rôle a été créé, mais il y a eu un problème lors de l\'attribution des permissions. Vous pouvez modifier le rôle pour ajouter les permissions.');
          
          // Navigate back to roles list after a delay
          setTimeout(() => {
            router.push('/admin/roles');
          }, 1500);
          return;
        }
      }
      
      toast.error('Erreur lors de la création du rôle');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/roles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Créer un Rôle</h1>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Informations du Rôle</CardTitle>
          <CardDescription>
            Entrez les détails du nouveau rôle et sélectionnez les permissions
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className={hasFieldError('name') || validationErrors.name ? 'text-red-500' : ''}>
                  Nom du Rôle
                </Label>
                <Input
                  id="name"
                  placeholder="Nom du rôle"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className={hasFieldError('name') || validationErrors.name ? 'border-red-500' : ''}
                />
                {hasFieldError('name') && (
                  <p className="text-sm text-red-500">{getFieldError('name')}</p>
                )}
                {validationErrors.name && (
                  <p className="text-sm text-red-500">{validationErrors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className={hasFieldError('description') || validationErrors.description ? 'text-red-500' : ''}>
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Description du rôle"
                  rows={3}
                  value={formData.description || ''}
                  onChange={handleChange}
                  className={hasFieldError('description') || validationErrors.description ? 'border-red-500' : ''}
                />
                {hasFieldError('description') && (
                  <p className="text-sm text-red-500">{getFieldError('description')}</p>
                )}
                {validationErrors.description && (
                  <p className="text-sm text-red-500">{validationErrors.description}</p>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className={validationErrors.permissions ? 'text-red-500' : ''}>
                    Permissions
                  </Label>
                  <div className="space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setExpandedCategories(permissionCategories.map(c => c.id))}
                    >
                      Tout Développer
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setExpandedCategories([])}
                    >
                      Tout Réduire
                    </Button>
                  </div>
                </div>
                
                {validationErrors.permissions && (
                  <p className="text-sm text-red-500">{validationErrors.permissions}</p>
                )}
                
                {loadingPermissions ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Chargement des permissions...</span>
                  </div>
                ) : (
                  <div className="space-y-4 border rounded-md p-4">
                    {permissionCategories.map((category) => (
                      <div key={category.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div 
                            className="flex items-center gap-2 font-medium cursor-pointer"
                            onClick={() => toggleCategory(category.id)}
                          >
                            <span className="text-lg">
                              {expandedCategories.includes(category.id) ? '▼' : '►'}
                            </span>
                            {category.name}
                          </div>
                          <div className="space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => selectAllInCategory(category.id)}
                            >
                              Tout Sélectionner
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => deselectAllInCategory(category.id)}
                            >
                              Tout Désélectionner
                            </Button>
                          </div>
                        </div>
                        
                        {expandedCategories.includes(category.id) && (
                          <div className="grid grid-cols-2 gap-4 ml-6 mt-2">
                            {category.permissions.map((permission) => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`permission-${permission.id}`}
                                  checked={formData.permissionIds?.includes(permission.id) || false}
                                  onCheckedChange={() => togglePermission(permission.id)}
                                />
                                <Label 
                                  htmlFor={`permission-${permission.id}`} 
                                  className="cursor-pointer flex-1"
                                >
                                  <div className="font-medium">{permission.name}</div>
                                  <div className="text-xs text-gray-500">{permission.description}</div>
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/roles">Annuler</Link>
            </Button>
            <Button type="submit" disabled={loading || loadingPermissions}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer le Rôle'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
