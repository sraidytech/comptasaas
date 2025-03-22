'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de Bord Super Admin</h1>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <span className="text-blue-500 text-sm font-medium">Locataires</span>
              <span className="text-3xl font-bold">2</span>
              <span className="text-gray-500 text-sm">Locataires actifs</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <span className="text-green-500 text-sm font-medium">Utilisateurs</span>
              <span className="text-3xl font-bold">5</span>
              <span className="text-gray-500 text-sm">Utilisateurs actifs</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <span className="text-purple-500 text-sm font-medium">Déclarations</span>
              <span className="text-3xl font-bold">3</span>
              <span className="text-gray-500 text-sm">Types de déclaration</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <span className="text-amber-500 text-sm font-medium">Livres</span>
              <span className="text-3xl font-bold">4</span>
              <span className="text-gray-500 text-sm">Types de livre</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tenant Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Locataires</CardTitle>
            <CardDescription>
              Créer et gérer les locataires du système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Gérez les locataires, leurs paramètres et leurs utilisateurs.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/admin/tenants">Voir les Locataires</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/tenants/new">Créer un Locataire</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Utilisateurs</CardTitle>
            <CardDescription>
              Gérer les administrateurs des locataires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Créez et gérez les administrateurs pour chaque locataire.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/admin/users">Voir les Utilisateurs</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/users/new">Créer un Administrateur</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Declaration Types Card */}
        <Card>
          <CardHeader>
            <CardTitle>Types de Déclaration</CardTitle>
            <CardDescription>
              Gérer les types de déclaration du système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Configurez les types de déclaration disponibles pour tous les locataires.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/admin/declaration-types">Voir les Types</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/declaration-types/new">Créer un Type</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Livre Types Card */}
        <Card>
          <CardHeader>
            <CardTitle>Types de Livre</CardTitle>
            <CardDescription>
              Gérer les types de livre du système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Configurez les types de livre disponibles pour tous les locataires.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/admin/livre-types">Voir les Types</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/livre-types/new">Créer un Type</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Roles & Permissions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Rôles et Permissions</CardTitle>
            <CardDescription>
              Gérer les rôles et permissions du système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Configurez les rôles et permissions disponibles dans le système.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/admin/roles">Voir les Rôles</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/permissions">Voir les Permissions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres Système</CardTitle>
            <CardDescription>
              Configurer les paramètres globaux
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Gérez les paramètres globaux du système et les configurations.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/admin/settings">Paramètres Système</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/logs">Journaux Système</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
