import { Metadata } from 'next';
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
import { PlusCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gestion des Locataires',
  description: 'Gérer les locataires du système',
};

// This would normally come from an API call
const tenants = [
  {
    id: '1',
    name: 'Default Tenant',
    description: 'Default tenant for testing',
    userCount: 3,
    clientCount: 5,
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    name: 'Second Tenant',
    description: 'Second tenant for testing multi-tenant functionality',
    userCount: 1,
    clientCount: 2,
    createdAt: '2025-01-20',
  },
];

export default function TenantsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Locataires</h1>
        <Button asChild>
          <Link href="/admin/tenants/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau Locataire
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Locataires</CardTitle>
          <CardDescription>
            Liste de tous les locataires dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Utilisateurs</TableHead>
                <TableHead className="text-right">Clients</TableHead>
                <TableHead>Date de Création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>{tenant.description}</TableCell>
                  <TableCell className="text-right">{tenant.userCount}</TableCell>
                  <TableCell className="text-right">{tenant.clientCount}</TableCell>
                  <TableCell>{tenant.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/tenants/${tenant.id}`}>
                          Détails
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/tenants/${tenant.id}/edit`}>
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
