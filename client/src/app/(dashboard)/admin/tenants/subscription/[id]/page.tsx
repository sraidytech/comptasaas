'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { format, addMonths, addYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft } from 'lucide-react';
import { tenantsApi, Tenant, SubscriptionPlan, PaymentStatus, PaymentMethod } from '@/lib/api/tenants';
import { useAsync } from '@/lib/hooks';

// Helper function to convert date string to Date object
const parseDate = (dateString?: string): Date | undefined => {
  if (!dateString) return undefined;
  return new Date(dateString);
};

// Helper function to format dates for display
const formatDateForDisplay = (dateString?: string) => {
  if (!dateString) return 'Non défini';
  const date = new Date(dateString);
  return format(date, 'dd MMMM yyyy', { locale: fr });
};

// Helper function to get subscription plan label in French
const getSubscriptionPlanLabel = (plan: SubscriptionPlan) => {
  switch (plan) {
    case SubscriptionPlan.NONE:
      return 'Aucun';
    case SubscriptionPlan.SIX_MONTHS:
      return '6 mois';
    case SubscriptionPlan.ONE_YEAR:
      return '1 an';
    default:
      return plan;
  }
};

// Helper function to get payment status label in French
const getPaymentStatusLabel = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.UNPAID:
      return 'Non payé';
    case PaymentStatus.PENDING:
      return 'En attente';
    case PaymentStatus.PAID:
      return 'Payé';
    case PaymentStatus.EXPIRED:
      return 'Expiré';
    default:
      return status;
  }
};

// Helper function to get payment method label in French
const getPaymentMethodLabel = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.BANK_TRANSFER:
      return 'Virement bancaire';
    default:
      return method;
  }
};

// Helper function to calculate end date based on start date and plan
const calculateEndDate = (startDate: Date | undefined, plan: SubscriptionPlan): Date | undefined => {
  if (!startDate || plan === SubscriptionPlan.NONE) return undefined;
  
  if (plan === SubscriptionPlan.SIX_MONTHS) {
    return addMonths(startDate, 6);
  } else if (plan === SubscriptionPlan.ONE_YEAR) {
    return addYears(startDate, 1);
  }
  
  return undefined;
};

export default function TenantSubscriptionPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params.id as string;
  
  // State for form
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>(SubscriptionPlan.NONE);
  const [subscriptionStart, setSubscriptionStart] = useState<Date | undefined>(undefined);
  const [subscriptionEnd, setSubscriptionEnd] = useState<Date | undefined>(undefined);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.UNPAID);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);
  const [paymentReference, setPaymentReference] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch tenant data
  const { data: tenant, loading, error, execute: fetchTenant } = useAsync<Tenant>(
    () => tenantsApi.getById(tenantId),
    true
  );
  
  // Update form with tenant data when loaded
  useEffect(() => {
    if (tenant) {
      setSubscriptionPlan(tenant.subscriptionPlan);
      setSubscriptionStart(parseDate(tenant.subscriptionStart));
      setSubscriptionEnd(parseDate(tenant.subscriptionEnd));
      setPaymentStatus(tenant.paymentStatus);
      setPaymentMethod(tenant.paymentMethod);
      setPaymentReference(tenant.paymentReference || '');
    }
  }, [tenant]);
  
  // Update end date when start date or plan changes
  useEffect(() => {
    if (subscriptionStart && subscriptionPlan !== SubscriptionPlan.NONE) {
      setSubscriptionEnd(calculateEndDate(subscriptionStart, subscriptionPlan));
    }
  }, [subscriptionStart, subscriptionPlan]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscriptionStart || !subscriptionEnd) {
      toast.error('Veuillez remplir les dates de début et de fin d\'abonnement');
      return;
    }
    
    if (paymentStatus === PaymentStatus.PAID && !paymentReference) {
      toast.error('La référence de paiement est requise pour les paiements marqués comme payés');
      return;
    }
    
    if (!password) {
      toast.error('Veuillez entrer votre mot de passe pour confirmer');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await tenantsApi.updateSubscription(tenantId, {
        subscriptionPlan,
        subscriptionStart: format(subscriptionStart, 'yyyy-MM-dd'),
        subscriptionEnd: format(subscriptionEnd, 'yyyy-MM-dd'),
        paymentStatus,
        paymentMethod,
        paymentReference,
        password,
      });
      
      toast.success('Abonnement mis à jour avec succès');
      router.push('/admin/tenants');
    } catch (error) {
      console.error('Error updating subscription:', error);
      
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Invalid password') || error.message.includes('Mot de passe invalide')) {
          toast.error('Mot de passe incorrect');
        } else {
          toast.error(`Erreur: ${error.message}`);
        }
      } else {
        toast.error('Une erreur est survenue lors de la mise à jour de l\'abonnement');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2">Chargement des informations du locataire...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 text-red-700 p-4 rounded-md max-w-md">
          <p>Une erreur est survenue lors du chargement des informations du locataire.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => fetchTenant()}
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/admin/tenants">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Gestion de l&apos;abonnement</h1>
      </div>
      
      {tenant && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations du locataire</CardTitle>
              <CardDescription>Détails du locataire sélectionné</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Nom</Label>
                <p className="text-lg font-semibold">{tenant.name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p>{tenant.description || 'Aucune description'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Statut</Label>
                <p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Date de création</Label>
                <p>{formatDateForDisplay(tenant.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Abonnement actuel</CardTitle>
              <CardDescription>Détails de l&apos;abonnement en cours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Plan d&apos;abonnement</Label>
                <p className="font-semibold">{getSubscriptionPlanLabel(tenant.subscriptionPlan)}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Période</Label>
                <p>
                  {tenant.subscriptionStart && tenant.subscriptionEnd
                    ? `${formatDateForDisplay(tenant.subscriptionStart)} - ${formatDateForDisplay(tenant.subscriptionEnd)}`
                    : 'Aucune période définie'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Statut de paiement</Label>
                <p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tenant.paymentStatus === PaymentStatus.PAID
                      ? 'bg-green-100 text-green-800'
                      : tenant.paymentStatus === PaymentStatus.PENDING
                      ? 'bg-yellow-100 text-yellow-800'
                      : tenant.paymentStatus === PaymentStatus.EXPIRED
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getPaymentStatusLabel(tenant.paymentStatus)}
                  </span>
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Méthode de paiement</Label>
                <p>{getPaymentMethodLabel(tenant.paymentMethod)}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Référence de paiement</Label>
                <p>{tenant.paymentReference || 'Aucune référence'}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Mettre à jour l&apos;abonnement</CardTitle>
              <CardDescription>Modifier les détails de l&apos;abonnement</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionPlan">Plan d&apos;abonnement</Label>
                    <Select
                      value={subscriptionPlan}
                      onValueChange={(value) => setSubscriptionPlan(value as SubscriptionPlan)}
                    >
                      <SelectTrigger id="subscriptionPlan">
                        <SelectValue placeholder="Sélectionner un plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SubscriptionPlan.NONE}>Aucun</SelectItem>
                        <SelectItem value={SubscriptionPlan.SIX_MONTHS}>6 mois</SelectItem>
                        <SelectItem value={SubscriptionPlan.ONE_YEAR}>1 an</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Statut de paiement</Label>
                    <Select
                      value={paymentStatus}
                      onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}
                    >
                      <SelectTrigger id="paymentStatus">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PaymentStatus.UNPAID}>Non payé</SelectItem>
                        <SelectItem value={PaymentStatus.PENDING}>En attente</SelectItem>
                        <SelectItem value={PaymentStatus.PAID}>Payé</SelectItem>
                        <SelectItem value={PaymentStatus.EXPIRED}>Expiré</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionStart">Date de début</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="subscriptionStart"
                        >
                          {subscriptionStart ? (
                            format(subscriptionStart, 'dd MMMM yyyy', { locale: fr })
                          ) : (
                            <span className="text-muted-foreground">Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={subscriptionStart}
                          onSelect={setSubscriptionStart}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionEnd">Date de fin</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="subscriptionEnd"
                          disabled={subscriptionPlan !== SubscriptionPlan.NONE}
                        >
                          {subscriptionEnd ? (
                            format(subscriptionEnd, 'dd MMMM yyyy', { locale: fr })
                          ) : (
                            <span className="text-muted-foreground">Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={subscriptionEnd}
                          onSelect={setSubscriptionEnd}
                          disabled={subscriptionPlan !== SubscriptionPlan.NONE}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {subscriptionPlan !== SubscriptionPlan.NONE && (
                      <p className="text-xs text-gray-500">
                        La date de fin est calculée automatiquement en fonction du plan et de la date de début
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Méthode de paiement</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                    >
                      <SelectTrigger id="paymentMethod">
                        <SelectValue placeholder="Sélectionner une méthode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PaymentMethod.BANK_TRANSFER}>Virement bancaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paymentReference">Référence de paiement</Label>
                    <Input
                      id="paymentReference"
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Ex: VIREMENT-123456"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="password">Mot de passe administrateur</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe pour confirmer"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Votre mot de passe est requis pour confirmer cette action
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/tenants')}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    'Mettre à jour l\'abonnement'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
