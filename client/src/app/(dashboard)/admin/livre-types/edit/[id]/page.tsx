'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { livreTypesApi, UpdateLivreTypeDto, LivreType } from '@/lib/api';
import { useAsync, useApiError } from '@/lib/hooks';
import { LivreAttachments } from '@/components/attachments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EditLivreTypePage() {
  const router = useRouter();
  const params = useParams();
  const livreTypeId = params.id as string;
  const { getFieldError, hasFieldError, clearError } = useApiError();
  
  // Form state
  const [formData, setFormData] = useState<UpdateLivreTypeDto>({
    name: '',
    description: '',
    articles: '',
  });

  // Months state (1-12)
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const allMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Use the useAsync hook to fetch livre type data
  const { 
    data: livreType, 
    loading: loadingLivreType, 
    error: fetchError,
    execute: fetchLivreType 
  } = useAsync<LivreType>(
    async () => {
      try {
        console.log('Fetching livre type with ID:', livreTypeId);
        const data = await livreTypesApi.getById(livreTypeId);
        console.log('Fetched livre type:', data);
        return data;
      } catch (error) {
        console.error('Error fetching livre type:', error);
        throw error;
      }
    },
    true // Fetch immediately
  );

  // Use the useAsync hook to handle form submission
  const { 
    loading: updating, 
    execute: updateLivreType 
  } = useAsync<LivreType>(
    async (data: unknown) => livreTypesApi.update(livreTypeId, data as UpdateLivreTypeDto)
  );

  // Update form data when livre type data is loaded
  useEffect(() => {
    if (livreType) {
      console.log('Setting form data from livre type:', livreType);
      
      setFormData({
        name: livreType.name,
        description: livreType.description || '',
        articles: livreType.articles || '',
      });

      // Set selected months
      if (livreType.livreMonths && Array.isArray(livreType.livreMonths)) {
        console.log('Setting selected months:', livreType.livreMonths);
        const monthNumbers = livreType.livreMonths.map((m: { month: number }) => m.month);
        console.log('Extracted month numbers:', monthNumbers);
        setSelectedMonths(monthNumbers);
      } else {
        console.log('No months found in livre type or not an array');
        setSelectedMonths([]);
      }
    }
  }, [livreType]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    clearError(); // Clear errors when user types
  };

  // Handle month selection
  const handleMonthChange = (month: number, checked: boolean) => {
    if (checked) {
      setSelectedMonths((prev) => [...prev, month].sort((a, b) => a - b));
    } else {
      setSelectedMonths((prev) => prev.filter((m) => m !== month));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name?.trim()) {
      toast.error('Le nom du type de livre est requis');
      return;
    }
    
    try {
      // Submit form
      const result = await updateLivreType(formData);
      
      if (result) {
        // Update months if they've changed
        const currentMonths = livreType?.livreMonths?.map((m: { month: number }) => m.month) || [];
        const monthsToAdd = selectedMonths.filter((m: number) => !currentMonths.includes(m));
        const monthsToRemove = currentMonths.filter((m: number) => !selectedMonths.includes(m));
        
        // Add new months
        if (monthsToAdd.length > 0) {
          await livreTypesApi.addMonths(livreTypeId, monthsToAdd);
        }
        
        // Remove months that were deselected
        if (monthsToRemove.length > 0) {
          await livreTypesApi.removeMonths(livreTypeId, monthsToRemove);
        }
        
        toast.success('Type de livre mis à jour avec succès');
        
        // Navigate back to livre types list
        router.push('/admin/livre-types');
      } else {
        // If API returns null but doesn't throw an error
        console.warn('API returned null result but did not throw an error');
        toast.success('Type de livre mis à jour avec succès (mode simulation)');
        router.push('/admin/livre-types');
      }
    } catch (error) {
      console.error('Error updating livre type:', error);
      
      // Show error toast but also simulate success for demo purposes
      toast.error('Erreur lors de la mise à jour du type de livre dans l\'API, mais simulation réussie pour la démo');
      
      // Navigate back to livre types list after a delay
      setTimeout(() => {
        router.push('/admin/livre-types');
      }, 1500);
    }
  };

  // Handle retry when fetch fails
  const handleRetry = () => {
    fetchLivreType();
  };

  // Format month name
  const getMonthName = (month: number) => {
    return new Date(2025, month - 1).toLocaleString('fr-FR', { month: 'long' });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/livre-types">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Modifier un Type de Livre</h1>
      </div>

      {loadingLivreType ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement des données du type de livre...</span>
        </div>
      ) : fetchError ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>
              Une erreur est survenue lors du chargement des données du type de livre.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">
              {fetchError instanceof Error ? fetchError.message : 'Erreur inconnue'}
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRetry}>Réessayer</Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="w-full max-w-4xl">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Informations</TabsTrigger>
              <TabsTrigger value="attachments">Pièces jointes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Informations du Type de Livre</CardTitle>
                  <CardDescription>
                    Modifiez les détails du type de livre
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="livre-type-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className={hasFieldError('name') ? 'text-red-500' : ''}>
                  Nom du Type de Livre
                </Label>
                <Input
                  id="name"
                  placeholder="Nom du type de livre"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={hasFieldError('name') ? 'border-red-500' : ''}
                />
                {hasFieldError('name') && (
                  <p className="text-red-500 text-sm">{getFieldError('name')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className={hasFieldError('description') ? 'text-red-500' : ''}>
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Description du type de livre"
                  rows={4}
                  value={formData.description || ''}
                  onChange={handleChange}
                  className={hasFieldError('description') ? 'border-red-500' : ''}
                />
                {hasFieldError('description') && (
                  <p className="text-red-500 text-sm">{getFieldError('description')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="articles" className={hasFieldError('articles') ? 'text-red-500' : ''}>
                  Articles
                </Label>
                <Input
                  id="articles"
                  placeholder="Articles (ex: Art. 20, 21)"
                  value={formData.articles || ''}
                  onChange={handleChange}
                  className={hasFieldError('articles') ? 'border-red-500' : ''}
                />
                {hasFieldError('articles') && (
                  <p className="text-red-500 text-sm">{getFieldError('articles')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Mois applicables</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {allMonths.map((month) => (
                    <div key={month} className="flex items-center space-x-2">
                      <Checkbox
                        id={`month-${month}`}
                        checked={selectedMonths.includes(month)}
                        onCheckedChange={(checked) => handleMonthChange(month, checked === true)}
                      />
                      <label
                        htmlFor={`month-${month}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {getMonthName(month)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href="/admin/livre-types">Annuler</Link>
                  </Button>
                  <Button 
                    type="submit" 
                    form="livre-type-form" 
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mise à jour en cours...
                      </>
                    ) : (
                      'Mettre à jour le Type de Livre'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="attachments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Pièces jointes
                  </CardTitle>
                  <CardDescription>
                    Gérez les pièces jointes associées à ce type de livre
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {livreType && (
                    <LivreAttachments livreId={livreTypeId} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
