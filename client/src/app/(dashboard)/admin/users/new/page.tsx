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
import { ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// This would normally come from an API call
const tenants = [
  {
    id: '1',
    name: 'Default Tenant',
  },
  {
    id: '2',
    name: 'Second Tenant',
  },
];

// This would normally come from an API call
const roles = [
  {
    id: '1',
    name: 'SUPER_ADMIN',
    description: 'Accès complet au système',
  },
  {
    id: '2',
    name: 'ADMIN',
    description: 'Accès complet à un locataire',
  },
  {
    id: '3',
    name: 'TEAM_MANAGER',
    description: 'Gestion d&apos;une équipe',
  },
  {
    id: '4',
    name: 'EMPLOYEE',
    description: 'Accès limité aux clients assignés',
  },
];

export default function NewUserPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [tenant, setTenant] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!username) newErrors.username = 'Le nom d&apos;utilisateur est requis';
    if (!email) newErrors.email = 'L&apos;email est requis';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email invalide';
    
    if (!password) newErrors.password = 'Le mot de passe est requis';
    else if (password.length < 8) newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    
    if (password !== confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    
    if (!role) newErrors.role = 'Le rôle est requis';
    
    // Tenant is required for all roles except SUPER_ADMIN
    if (role && role !== 'SUPER_ADMIN' && !tenant) {
      newErrors.tenant = 'Le locataire est requis pour ce rôle';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // This would normally call an API to create the user
      console.log('Creating user:', {
        username,
        email,
        password,
        role,
        tenant: role === 'SUPER_ADMIN' ? null : tenant,
        isActive,
      });
      
      // Redirect to users list
      // router.push('/admin/users');
      
      // For now, just reset the form
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('');
      setTenant('');
      setIsActive(true);
      setErrors({});
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
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d&apos;utilisateur</Label>
                <Input
                  id="username"
                  placeholder="Nom d&apos;utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.name}>
                        {r.name} - {r.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role}</p>
                )}
              </div>
              
              {role && role !== 'SUPER_ADMIN' && (
                <div className="space-y-2">
                  <Label htmlFor="tenant">Locataire</Label>
                  <Select value={tenant} onValueChange={setTenant}>
                    <SelectTrigger id="tenant">
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
                  {errors.tenant && (
                    <p className="text-sm text-red-500">{errors.tenant}</p>
                  )}
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isActive">Utilisateur actif</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/users">Annuler</Link>
            </Button>
            <Button type="submit">Créer l&apos;Utilisateur</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
