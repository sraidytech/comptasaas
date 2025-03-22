'use client';

import { useState } from 'react';
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
import { ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// This would normally come from an API call
const permissionCategories = [
  {
    id: '1',
    name: 'Gestion des Utilisateurs',
    permissions: [
      { id: '1', name: 'user:create', description: 'Créer des utilisateurs' },
      { id: '2', name: 'user:read', description: 'Voir les utilisateurs' },
      { id: '3', name: 'user:update', description: 'Modifier des utilisateurs' },
      { id: '4', name: 'user:delete', description: 'Supprimer des utilisateurs' },
    ],
  },
  {
    id: '2',
    name: 'Gestion des Clients',
    permissions: [
      { id: '5', name: 'client:create', description: 'Créer des clients' },
      { id: '6', name: 'client:read', description: 'Voir les clients' },
      { id: '7', name: 'client:update', description: 'Modifier des clients' },
      { id: '8', name: 'client:delete', description: 'Supprimer des clients' },
      { id: '9', name: 'client:assign', description: 'Assigner des clients aux utilisateurs' },
    ],
  },
  {
    id: '3',
    name: 'Gestion des Déclarations',
    permissions: [
      { id: '10', name: 'declaration:create', description: 'Créer des déclarations' },
      { id: '11', name: 'declaration:read', description: 'Voir les déclarations' },
      { id: '12', name: 'declaration:update', description: 'Modifier des déclarations' },
      { id: '13', name: 'declaration:delete', description: 'Supprimer des déclarations' },
      { id: '14', name: 'declaration:submit', description: 'Soumettre des déclarations' },
      { id: '15', name: 'declaration:approve', description: 'Approuver des déclarations' },
    ],
  },
  {
    id: '4',
    name: 'Gestion des Livres',
    permissions: [
      { id: '16', name: 'livre:create', description: 'Créer des livres' },
      { id: '17', name: 'livre:read', description: 'Voir les livres' },
      { id: '18', name: 'livre:update', description: 'Modifier des livres' },
      { id: '19', name: 'livre:delete', description: 'Supprimer des livres' },
      { id: '20', name: 'livre:submit', description: 'Soumettre des livres' },
      { id: '21', name: 'livre:approve', description: 'Approuver des livres' },
    ],
  },
];

export default function NewRolePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Le nom est requis';
    if (!description) newErrors.description = 'La description est requise';
    if (selectedPermissions.length === 0) newErrors.permissions = 'Au moins une permission doit être sélectionnée';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // This would normally call an API to create the role
      console.log('Creating role:', {
        name,
        description,
        permissions: selectedPermissions,
      });
      
      // Redirect to roles list
      // router.push('/admin/roles');
      
      // For now, just reset the form
      setName('');
      setDescription('');
      setSelectedPermissions([]);
      setErrors({});
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAllInCategory = (categoryId: string) => {
    const category = permissionCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    const categoryPermissionIds = category.permissions.map(p => p.id);
    const newSelectedPermissions = [...selectedPermissions];
    
    categoryPermissionIds.forEach(id => {
      if (!newSelectedPermissions.includes(id)) {
        newSelectedPermissions.push(id);
      }
    });
    
    setSelectedPermissions(newSelectedPermissions);
  };

  const deselectAllInCategory = (categoryId: string) => {
    const category = permissionCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    const categoryPermissionIds = category.permissions.map(p => p.id);
    setSelectedPermissions(prev => 
      prev.filter(id => !categoryPermissionIds.includes(id))
    );
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
                <Label htmlFor="name">Nom du Rôle</Label>
                <Input
                  id="name"
                  placeholder="Nom du rôle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description du rôle"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Permissions</Label>
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
                
                {errors.permissions && (
                  <p className="text-sm text-red-500">{errors.permissions}</p>
                )}
                
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
                                checked={selectedPermissions.includes(permission.id)}
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
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/roles">Annuler</Link>
            </Button>
            <Button type="submit">Créer le Rôle</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
