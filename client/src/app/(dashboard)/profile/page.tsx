'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentUser, type User } from '@/lib/auth';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      // Convert the User type to the state type
      setUser({
        id: currentUser.id,
        email: currentUser.email,
        username: currentUser.username,
        role: currentUser.role,
        tenantId: currentUser.tenantId
      });
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
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
      
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
            {user.tenantId && (
              <div className="space-y-2">
                <Label htmlFor="tenant">ID Locataire</Label>
                <Input id="tenant" value={user.tenantId} readOnly />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Modifier le mot de passe
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Préférences</CardTitle>
            <CardDescription>
              Personnalisez votre expérience utilisateur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Gérez vos préférences de notification.
                </p>
              </div>
              <Button variant="outline">Configurer</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Langue</p>
                <p className="text-sm text-muted-foreground">
                  Choisissez votre langue préférée.
                </p>
              </div>
              <Button variant="outline">Changer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
