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
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const months = [
  { id: 1, name: 'Janvier' },
  { id: 2, name: 'Février' },
  { id: 3, name: 'Mars' },
  { id: 4, name: 'Avril' },
  { id: 5, name: 'Mai' },
  { id: 6, name: 'Juin' },
  { id: 7, name: 'Juillet' },
  { id: 8, name: 'Août' },
  { id: 9, name: 'Septembre' },
  { id: 10, name: 'Octobre' },
  { id: 11, name: 'Novembre' },
  { id: 12, name: 'Décembre' },
];

export default function NewLivreTypePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [articles, setArticles] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Le nom est requis';
    if (!description) newErrors.description = 'La description est requise';
    if (selectedMonths.length === 0) newErrors.months = 'Au moins un mois doit être sélectionné';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // This would normally call an API to create the livre type
      console.log('Creating livre type:', {
        name,
        description,
        articles,
        months: selectedMonths,
      });
      
      // Redirect to livre types list
      // router.push('/admin/livre-types');
      
      // For now, just reset the form
      setName('');
      setDescription('');
      setArticles('');
      setSelectedMonths([]);
      setErrors({});
    }
  };

  const toggleMonth = (monthId: number) => {
    setSelectedMonths(prev => 
      prev.includes(monthId)
        ? prev.filter(id => id !== monthId)
        : [...prev, monthId]
    );
  };

  const handleQuarterlySelection = () => {
    setSelectedMonths([3, 6, 9, 12]);
  };

  const handleMonthlySelection = () => {
    setSelectedMonths(months.map(m => m.id));
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/livre-types">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Créer un Type de Livre</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations du Type de Livre</CardTitle>
          <CardDescription>
            Entrez les détails du nouveau type de livre
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  placeholder="Nom du type de livre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description du type de livre"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="articles">Articles (optionnel)</Label>
                <Input
                  id="articles"
                  placeholder="Ex: Art. 22, 23"
                  value={articles}
                  onChange={(e) => setArticles(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Mois applicables</Label>
                {errors.months && (
                  <p className="text-sm text-red-500">{errors.months}</p>
                )}
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {months.map((month) => (
                    <div key={month.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`month-${month.id}`}
                        checked={selectedMonths.includes(month.id)}
                        onCheckedChange={() => toggleMonth(month.id)}
                      />
                      <Label htmlFor={`month-${month.id}`} className="cursor-pointer">
                        {month.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <div className="space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleMonthlySelection}
                    >
                      Mensuel
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleQuarterlySelection}
                    >
                      Trimestriel
                    </Button>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMonths([])}
                  >
                    Désélectionner tous
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/livre-types">Annuler</Link>
            </Button>
            <Button type="submit">Créer le Type de Livre</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
