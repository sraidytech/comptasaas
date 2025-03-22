'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
import { PlusCircle, Search, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';

// This would normally come from an API call
const roles = [
  {
    id: '1',
    name: 'SUPER_ADMIN',
    description: 'Accès complet au système',
    permissionCount: 'Toutes',
    createdAt: '2025-01-15',
    isSystem: true,
  },
  {
    id: '2',
    name: 'ADMIN',
    description: 'Accès complet à un locataire',
    permissionCount: '42',
    createdAt: '2025-01-15',
    isSystem: true,
  },
  {
    id: '3',
    name: 'TEAM_MANAGER',
    description: 'Gestion d\'une équipe',
    permissionCount: '28',
    createdAt: '2025-01-15',
    isSystem: true,
  },
  {
    id: '4',
    name: 'EMPLOYEE',
    description: 'Accès limité aux clients assignés',
    permissionCount: '15',
    createdAt: '2025-01-15',
    isSystem: true,
  },
  {
    id: '5',
    name: 'READ_ONLY_AUDITOR',
    description: 'Accès en lecture seule pour audit',
    permissionCount: '8',
    createdAt: '2025-02-10',
    isSystem: false,
  },
];

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {filteredRoles.map((role) => (
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
                  <TableCell>{role.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/roles/${role.id}/permissions`}>
                          Permissions
                        </Link>
                      </Button>
                      {!role.isSystem && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/roles/${role.id}/edit`}>
                            Modifier
                          </Link>
                        </Button>
                      )}
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
