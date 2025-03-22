'use client';

import { useState } from 'react';
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
import { Search, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// This would normally come from an API call
const permissions = [
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
              {filteredPermissions.map((permission) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
