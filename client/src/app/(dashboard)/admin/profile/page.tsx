'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentUser } from '@/lib/auth';

export default function AdminProfilePage() {
  const [user, setUser] = useState<{
    id: string;
    email: string;
    username: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Profil Super Admin</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
            <CardDescription>
              Gérez vos informations personnelles et vos paramètres de compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <Input id="username" value={user.username} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Input id="role" value={user.role} readOnly />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Modifier le mot de passe
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres de sécurité</CardTitle>
            <CardDescription>
              Gérez les paramètres de sécurité de votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Authentification à deux facteurs</p>
                <p className="text-sm text-muted-foreground">
                  Ajoutez une couche de sécurité supplémentaire à votre compte.
                </p>
              </div>
              <Button variant="outline">Configurer</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sessions actives</p>
                <p className="text-sm text-muted-foreground">
                  Gérez vos sessions actives sur différents appareils.
                </p>
              </div>
              <Button variant="outline">Gérer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
