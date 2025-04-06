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
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { usersApi, rolesApi, tenantsApi, CreateUserDto, Role, Tenant } from '@/lib/api';
import { useAsync, useApiError } from '@/lib/hooks';

// Empty arrays for initial state
const emptyTenants: Tenant[] = [];
const emptyRoles: Role[] = [];

export default function NewUserPage() {
  const router = useRouter();
  const { getFieldError, hasFieldError, clearError } = useApiError();
  
  // State for roles and tenants
  const [roles, setRoles] = useState<Role[]>(emptyRoles);
  const [tenants, setTenants] = useState<Tenant[]>(emptyTenants);
  
  // Form state
  const [formData, setFormData] = useState<CreateUserDto & { confirmPassword: string }>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: '',
    tenantId: '',
    isActive: true,
  });
  
  // UI state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Fetch roles from API
  const { data: apiRoles, loading: loadingRoles } = useAsync<Role[]>(
    async () => {
      try {
        return await rolesApi.getAll();
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Erreur lors du chargement des rôles');
        return [];
      }
    },
    true // Fetch immediately
  );
  
  // Fetch tenants from API
  const { data: apiTenants, loading: loadingTenants } = useAsync<Tenant[]>(
    async () => {
      try {
        return await tenantsApi.getAll();
      } catch (error) {
        console.error('Error fetching tenants:', error);
        toast.error('Erreur lors du chargement des locataires');
        return [];
      }
    },
    true // Fetch immediately
  );
  
  // Create user
  const { loading, execute: createUser } = useAsync<unknown>(
    async (data: unknown) => {
      try {
        // Convert to the expected type
        const formData = data as CreateUserDto & { confirmPassword: string };
        
        // Create a new object without the confirmPassword field
        const userData: CreateUserDto = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          roleId: formData.roleId,
          tenantId: formData.tenantId,
          isActive: formData.isActive,
        };
        
        // If role is SUPER_ADMIN or ADMIN, set tenantId to undefined
        if (userData.roleId) {
          const selectedRole = roles.find(r => r.id === userData.roleId);
          if (selectedRole && (selectedRole.name === 'SUPER_ADMIN' || selectedRole.name === 'ADMIN')) {
            userData.tenantId = undefined;
          }
        }
        
        return await usersApi.create(userData);
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    }
  );
  
  // Update roles and tenants when API data is loaded
  useEffect(() => {
    if (apiRoles && apiRoles.length > 0) {
      setRoles(apiRoles);
    }
  }, [apiRoles]);
  
  useEffect(() => {
    if (apiTenants && apiTenants.length > 0) {
      setTenants(apiTenants);
    }
  }, [apiTenants]);
  
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
  
  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
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
    
    // If role is changed to SUPER_ADMIN or ADMIN, clear tenant
    if (id === 'roleId') {
      const selectedRole = roles.find(r => r.id === value);
      if (selectedRole && (selectedRole.name === 'SUPER_ADMIN' || selectedRole.name === 'ADMIN')) {
        setFormData((prev) => ({ ...prev, tenantId: '' }));
      }
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: checked }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username?.trim()) newErrors.username = 'Le nom d\'utilisateur est requis';
    if (!formData.email?.trim()) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    
    if (!formData.password?.trim()) newErrors.password = 'Le mot de passe est requis';
    else if (formData.password.length < 8) newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    
    if (!formData.roleId) newErrors.roleId = 'Le rôle est requis';
    
    // Tenant is required for all roles except SUPER_ADMIN and ADMIN
    const selectedRole = roles.find(r => r.id === formData.roleId);
    if (selectedRole && 
        selectedRole.name !== 'SUPER_ADMIN' && 
        selectedRole.name !== 'ADMIN' && 
        !formData.tenantId) {
      newErrors.tenantId = 'Le locataire est requis pour ce rôle';
    }
    
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
      // Submit form
      const result = await createUser(formData);
      
      if (result) {
        toast.success('Utilisateur créé avec succès');
        
        // Log the created user
        console.log('User created:', result);
        
        // Navigate back to users list
        router.push('/admin/users');
      } else {
        // If API returns null but doesn't throw an error
        console.warn('API returned null result but did not throw an error');
        toast.error('Erreur lors de la création de l\'utilisateur');
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Erreur lors de la création de l\'utilisateur');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Créer un Utilisateur</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations de l&apos;Utilisateur</CardTitle>
          <CardDescription>
            Entrez les détails du nouvel utilisateur
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            {(loadingRoles || loadingTenants) ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Chargement des données...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className={hasFieldError('username') || validationErrors.username ? 'text-red-500' : ''}>
                    Nom d&apos;utilisateur
                  </Label>
                  <Input
                    id="username"
                    placeholder="Nom d'utilisateur"
                    value={formData.username || ''}
                    onChange={handleChange}
                    className={hasFieldError('username') || validationErrors.username ? 'border-red-500' : ''}
                  />
                  {hasFieldError('username') && (
                    <p className="text-sm text-red-500">{getFieldError('username')}</p>
                  )}
                  {validationErrors.username && (
                    <p className="text-sm text-red-500">{validationErrors.username}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className={hasFieldError('email') || validationErrors.email ? 'text-red-500' : ''}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemple.com"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className={hasFieldError('email') || validationErrors.email ? 'border-red-500' : ''}
                  />
                  {hasFieldError('email') && (
                    <p className="text-sm text-red-500">{getFieldError('email')}</p>
                  )}
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className={hasFieldError('password') || validationErrors.password ? 'text-red-500' : ''}>
                      Mot de passe
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password || ''}
                      onChange={handleChange}
                      className={hasFieldError('password') || validationErrors.password ? 'border-red-500' : ''}
                    />
                    {hasFieldError('password') && (
                      <p className="text-sm text-red-500">{getFieldError('password')}</p>
                    )}
                    {validationErrors.password && (
                      <p className="text-sm text-red-500">{validationErrors.password}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className={validationErrors.confirmPassword ? 'text-red-500' : ''}>
                      Confirmer le mot de passe
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword || ''}
                      onChange={handleChange}
                      className={validationErrors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {validationErrors.confirmPassword && (
                      <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roleId" className={hasFieldError('roleId') || validationErrors.roleId ? 'text-red-500' : ''}>
                    Rôle
                  </Label>
                  <Select 
                    value={formData.roleId || ''} 
                    onValueChange={(value) => handleSelectChange('roleId', value)}
                  >
                    <SelectTrigger id="roleId" className={hasFieldError('roleId') || validationErrors.roleId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} - {r.description || ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasFieldError('roleId') && (
                    <p className="text-sm text-red-500">{getFieldError('roleId')}</p>
                  )}
                  {validationErrors.roleId && (
                    <p className="text-sm text-red-500">{validationErrors.roleId}</p>
                  )}
                </div>
                
                {formData.roleId && 
                  roles.find(r => r.id === formData.roleId)?.name !== 'SUPER_ADMIN' && 
                  roles.find(r => r.id === formData.roleId)?.name !== 'ADMIN' && (
                  <div className="space-y-2">
                    <Label htmlFor="tenantId" className={hasFieldError('tenantId') || validationErrors.tenantId ? 'text-red-500' : ''}>
                      Locataire
                    </Label>
                    <Select 
                      value={formData.tenantId || ''} 
                      onValueChange={(value) => handleSelectChange('tenantId', value)}
                    >
                      <SelectTrigger id="tenantId" className={hasFieldError('tenantId') || validationErrors.tenantId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Sélectionner un locataire" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {hasFieldError('tenantId') && (
                      <p className="text-sm text-red-500">{getFieldError('tenantId')}</p>
                    )}
                    {validationErrors.tenantId && (
                      <p className="text-sm text-red-500">{validationErrors.tenantId}</p>
                    )}
                  </div>
                )}
                
                {formData.roleId && roles.find(r => r.id === formData.roleId)?.name === 'ADMIN' && (
                  <div className="p-4 bg-blue-50 rounded-md">
                    <p className="text-blue-700">
                      Un nouveau locataire sera automatiquement créé pour cet administrateur.
                    </p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive || false}
                    onCheckedChange={(checked) => handleCheckboxChange('isActive', checked === true)}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Utilisateur actif
                  </Label>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/users">Annuler</Link>
            </Button>
            <Button type="submit" disabled={loading || loadingRoles || loadingTenants}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer l&apos;Utilisateur'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
