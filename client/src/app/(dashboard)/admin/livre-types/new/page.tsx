'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { livreTypesApi, CreateLivreTypeDto } from '@/lib/api';
import { useAsync, useApiError } from '@/lib/hooks';

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
  const router = useRouter();
  const { getFieldError, hasFieldError, clearError } = useApiError();
  
  // Form state
  const [formData, setFormData] = useState<CreateLivreTypeDto>({
    name: '',
    description: '',
    articles: '',
    months: [],
  });
  
  // Local validation errors (separate from API errors)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Use the useAsync hook to handle form submission
  const { loading, execute: createLivreType } = useAsync<unknown>(
    async (data: unknown) => {
      try {
        // Try to create via API
        return await livreTypesApi.create(data as CreateLivreTypeDto);
      } catch (error) {
        console.error('Error creating livre type:', error);
        throw error;
      }
    }
  );

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    // Clear validation error for this field
    if (validationErrors[id]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
    
    // Clear API error
    clearError();
  };

  // Toggle month selection
  const toggleMonth = (monthId: number) => {
    setFormData(prev => ({
      ...prev,
      months: prev.months?.includes(monthId)
        ? prev.months.filter(id => id !== monthId)
        : [...(prev.months || []), monthId]
    }));
    
    // Clear months validation error if any months are selected
    if (validationErrors.months) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.months;
        return newErrors;
      });
    }
  };

  // Handle quarterly selection (months 3, 6, 9, 12)
  const handleQuarterlySelection = () => {
    setFormData(prev => ({
      ...prev,
      months: [3, 6, 9, 12]
    }));
    
    // Clear months validation error
    if (validationErrors.months) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.months;
        return newErrors;
      });
    }
  };

  // Handle monthly selection (all months)
  const handleMonthlySelection = () => {
    setFormData(prev => ({
      ...prev,
      months: months.map(m => m.id)
    }));
    
    // Clear months validation error
    if (validationErrors.months) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.months;
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.description?.trim()) newErrors.description = 'La description est requise';
    if (!formData.months?.length) newErrors.months = 'Au moins un mois doit être sélectionné';
    
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      // Submit form
      const result = await createLivreType(formData);
      
      if (result) {
        toast.success('Type de livre créé avec succès');
        
        // Log the created livre type
        console.log('Livre type created:', result);
        
        // Navigate back to livre types list
        router.push('/admin/livre-types');
      } else {
        // If API returns null but doesn't throw an error
        console.warn('API returned null result but did not throw an error');
        toast.error('Erreur lors de la création du type de livre');
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Erreur lors de la création du type de livre');
    }
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
                <Label htmlFor="name" className={hasFieldError('name') || validationErrors.name ? 'text-red-500' : ''}>
                  Nom
                </Label>
                <Input
                  id="name"
                  placeholder="Nom du type de livre"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className={hasFieldError('name') || validationErrors.name ? 'border-red-500' : ''}
                />
                {hasFieldError('name') && (
                  <p className="text-sm text-red-500">{getFieldError('name')}</p>
                )}
                {validationErrors.name && (
                  <p className="text-sm text-red-500">{validationErrors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className={hasFieldError('description') || validationErrors.description ? 'text-red-500' : ''}>
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Description du type de livre"
                  rows={4}
                  value={formData.description || ''}
                  onChange={handleChange}
                  className={hasFieldError('description') || validationErrors.description ? 'border-red-500' : ''}
                />
                {hasFieldError('description') && (
                  <p className="text-sm text-red-500">{getFieldError('description')}</p>
                )}
                {validationErrors.description && (
                  <p className="text-sm text-red-500">{validationErrors.description}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="articles" className={hasFieldError('articles') ? 'text-red-500' : ''}>
                  Articles (optionnel)
                </Label>
                <Input
                  id="articles"
                  placeholder="Ex: Art. 22, 23"
                  value={formData.articles || ''}
                  onChange={handleChange}
                  className={hasFieldError('articles') ? 'border-red-500' : ''}
                />
                {hasFieldError('articles') && (
                  <p className="text-sm text-red-500">{getFieldError('articles')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className={validationErrors.months ? 'text-red-500' : ''}>
                  Mois applicables
                </Label>
                {validationErrors.months && (
                  <p className="text-sm text-red-500">{validationErrors.months}</p>
                )}
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {months.map((month) => (
                    <div key={month.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`month-${month.id}`}
                        checked={formData.months?.includes(month.id) || false}
                        onCheckedChange={() => toggleMonth(month.id)}
                      />
                      <Label 
                        htmlFor={`month-${month.id}`} 
                        className="cursor-pointer"
                      >
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
                    onClick={() => setFormData(prev => ({ ...prev, months: [] }))}
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
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer le Type de Livre'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
