import { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'Créer un Locataire',
  description: 'Créer un nouveau locataire dans le système',
};

export default function NewTenantPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/tenants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Créer un Locataire</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations du Locataire</CardTitle>
          <CardDescription>
            Entrez les détails du nouveau locataire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du Locataire</Label>
              <Input
                id="name"
                placeholder="Nom du locataire"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description du locataire"
                rows={4}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/admin/tenants">Annuler</Link>
          </Button>
          <Button>Créer le Locataire</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
