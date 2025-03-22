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
import { PlusCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// This would normally come from an API call
const users = [
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
              {filteredUsers.map((user) => (
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
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/users/${user.id}`}>
                          Détails
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/users/${user.id}/edit`}>
                          Modifier
                        </Link>
                      </Button>
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
