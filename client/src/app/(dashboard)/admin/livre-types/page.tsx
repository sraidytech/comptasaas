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
const livreTypes = [
  {
    id: '1',
    name: 'Journal des Achats',
    description: 'Livre comptable pour enregistrer les achats',
    articles: 'Art. 22, 23',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    name: 'Journal des Ventes',
    description: 'Livre comptable pour enregistrer les ventes',
    articles: 'Art. 24, 25',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    createdAt: '2025-01-15',
  },
  {
    id: '3',
    name: 'Grand Livre',
    description: 'Livre comptable principal regroupant tous les comptes',
    articles: 'Art. 26, 27',
    months: [3, 6, 9, 12],
    createdAt: '2025-01-15',
  },
  {
    id: '4',
    name: 'Balance',
    description: 'État comptable présentant les soldes des comptes',
    articles: 'Art. 28, 29',
    months: [3, 6, 9, 12],
    createdAt: '2025-01-15',
  },
];

export default function LivreTypesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredLivreTypes = livreTypes.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.articles.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Types de Livre</h1>
        <Button asChild>
          <Link href="/admin/livre-types/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau Type
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Types de Livre</CardTitle>
          <CardDescription>
            Liste de tous les types de livre dans le système
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher par nom, description ou articles..."
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
                <TableHead>Articles</TableHead>
                <TableHead>Mois</TableHead>
                <TableHead>Date de Création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLivreTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{type.description}</TableCell>
                  <TableCell>{type.articles}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {type.months.map((month) => (
                        <span 
                          key={month} 
                          className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                        >
                          {new Date(2025, month - 1).toLocaleString('fr-FR', { month: 'short' })}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{type.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/livre-types/${type.id}`}>
                          Détails
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/livre-types/${type.id}/edit`}>
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
