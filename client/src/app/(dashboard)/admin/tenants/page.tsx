/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Loader2, Power, Edit, Calendar, Trash2, CreditCard } from 'lucide-react';
import { tenantsApi, Tenant, PaymentStatus } from '@/lib/api/tenants';
import { useAsync } from '@/lib/hooks';

// Interface for status update dialog
interface StatusDialogProps {
  tenant: ExtendedTenant;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  dialogTitle: string;
  dialogDescription: string;
}

// Interface for payment status update dialog
interface PaymentStatusDialogProps {
  tenant: ExtendedTenant;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: PaymentStatus, password: string) => Promise<void>;
}

// Status update dialog component
function StatusDialog({ tenant, isOpen, onClose, onConfirm, dialogTitle, dialogDescription }: StatusDialogProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onConfirm(password);
      onClose();
    } catch (error) {
      console.error('Error updating tenant status:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors de la mise à jour du statut');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe administrateur</Label>
              <Input
                id="password"
                type="password"
                placeholder="Entrez votre mot de passe pour confirmer"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Traitement en cours...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Payment status update dialog component
function PaymentStatusDialog({ tenant, isOpen, onClose, onConfirm }: PaymentStatusDialogProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus>(tenant.paymentStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onConfirm(selectedStatus, password);
      onClose();
    } catch (error) {
      console.error('Error updating payment status:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors de la mise à jour du statut de paiement');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get status label and color
  const getStatusLabel = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return { label: 'Payé', color: 'bg-green-100 text-green-800' };
      case PaymentStatus.PENDING:
        return { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' };
      case PaymentStatus.EXPIRED:
        return { label: 'Expiré', color: 'bg-red-100 text-red-800' };
      case PaymentStatus.UNPAID:
      default:
        return { label: 'Non payé', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Modifier le statut de paiement pour "{tenant.name}"
          </DialogTitle>
          <DialogDescription>
            Le changement de statut de paiement peut affecter l'accès des utilisateurs au système.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Statut de paiement</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(PaymentStatus).map((status) => {
                  const { label, color } = getStatusLabel(status);
                  return (
                    <Button
                      key={status.toString()}
                      type="button"
                      variant="outline"
                      className={`justify-start ${selectedStatus === status ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedStatus(status)}
                    >
                      <span className={`mr-2 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                        {label}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe administrateur</Label>
              <Input
                id="password"
                type="password"
                placeholder="Entrez votre mot de passe pour confirmer"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                'Confirmer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Extended tenant type with additional UI-specific properties
interface ExtendedTenant extends Tenant {
  userCount?: number;
  clientCount?: number;
}

// Mock data for development until API is ready
const MOCK_TENANTS: ExtendedTenant[] = [
  {
    id: '1',
    name: 'Default Tenant',
    description: 'Default tenant for testing',
    isActive: true,
    subscriptionPlan: 'NONE' as any,
    paymentStatus: 'UNPAID' as any,
    paymentMethod: 'BANK_TRANSFER' as any,
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z',
    userCount: 3,
    clientCount: 5,
  },
  {
    id: '2',
    name: 'Second Tenant',
    description: 'Second tenant for testing multi-tenant functionality',
    isActive: true,
    subscriptionPlan: 'NONE' as any,
    paymentStatus: 'UNPAID' as any,
    paymentMethod: 'BANK_TRANSFER' as any,
    createdAt: '2025-01-20T00:00:00.000Z',
    updatedAt: '2025-01-20T00:00:00.000Z',
    userCount: 1,
    clientCount: 2,
  },
];

export default function TenantsPage() {
  // State for dialogs
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentStatusDialogOpen, setPaymentStatusDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<ExtendedTenant | null>(null);

  // State for extended tenants with user and client counts
  const [extendedTenants, setExtendedTenants] = useState<ExtendedTenant[]>(MOCK_TENANTS);
  
  // Use the useAsync hook to fetch tenants
  const { data: apiTenants, loading, error, execute: fetchTenants } = useAsync<Tenant[]>(
    async () => {
      try {
        // Try to fetch from API
        return await tenantsApi.getAll();
      } catch (error) {
        console.error('Error fetching tenants from API:', error);
        // Return mock data if API fails
        return MOCK_TENANTS;
      }
    },
    true // Fetch immediately
  );

  // Format date to a readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get payment status label and color
  const getPaymentStatusInfo = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return { label: 'Payé', color: 'bg-green-100 text-green-800' };
      case PaymentStatus.PENDING:
        return { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' };
      case PaymentStatus.EXPIRED:
        return { label: 'Expiré', color: 'bg-red-100 text-red-800' };
      case PaymentStatus.UNPAID:
      default:
        return { label: 'Non payé', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // When tenants data changes, update the extended tenants
  useEffect(() => {
    if (apiTenants && Array.isArray(apiTenants) && apiTenants.length > 0) {
      // Use the actual counts from the API
      const extended = apiTenants.map(tenant => ({
        ...tenant,
        userCount: tenant._count?.users || 0,
        clientCount: tenant._count?.clients || 0,
      }));
      setExtendedTenants(extended);
    } else {
      // Use mock data if API returns empty or invalid data
      setExtendedTenants(MOCK_TENANTS);
    }
  }, [apiTenants]);

  // Handle status update confirmation
  const handleStatusConfirm = async (password: string) => {
    if (!selectedTenant) return;
    
    try {
      // Call the API to update the tenant status with password confirmation
      await tenantsApi.updateStatus(selectedTenant.id, {
        isActive: !selectedTenant.isActive,
        password,
      });
      
      // Show success message
      toast.success(
        selectedTenant.isActive 
          ? `Locataire "${selectedTenant.name}" désactivé avec succès` 
          : `Locataire "${selectedTenant.name}" activé avec succès`
      );
      
      // Refresh the list
      fetchTenants();
    } catch (error) {
      console.error(`Error updating tenant status with ID ${selectedTenant.id}:`, error);
      
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Invalid password')) {
          throw new Error('Mot de passe incorrect');
        } else if (error.message.includes('SUPER_ADMIN')) {
          throw new Error('Impossible de désactiver un locataire avec des utilisateurs SUPER_ADMIN');
        }
      }
      
      throw new Error(`Erreur lors de la mise à jour du statut du locataire "${selectedTenant.name}"`);
    }
  };

  // Handle payment status update confirmation
  const handlePaymentStatusConfirm = async (status: PaymentStatus, password: string) => {
    if (!selectedTenant) return;
    
    try {
      // Call the API to update the tenant subscription with password confirmation
      await tenantsApi.updateSubscription(selectedTenant.id, {
        subscriptionPlan: selectedTenant.subscriptionPlan,
        subscriptionStart: selectedTenant.subscriptionStart || new Date().toISOString(),
        subscriptionEnd: selectedTenant.subscriptionEnd || new Date().toISOString(),
        paymentStatus: status,
        paymentMethod: selectedTenant.paymentMethod,
        paymentReference: selectedTenant.paymentReference || '',
        password,
      });
      
      // Show success message
      toast.success(`Statut de paiement mis à jour avec succès pour "${selectedTenant.name}"`);
      
      // Refresh the list
      fetchTenants();
    } catch (error) {
      console.error(`Error updating payment status for tenant with ID ${selectedTenant.id}:`, error);
      
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Invalid password')) {
          throw new Error('Mot de passe incorrect');
        } else {
          throw new Error(error.message);
        }
      }
      
      throw new Error(`Erreur lors de la mise à jour du statut de paiement pour "${selectedTenant.name}"`);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Status update dialogs */}
      {selectedTenant && (
        <>
          <StatusDialog
            tenant={selectedTenant}
            isOpen={statusDialogOpen}
            onClose={() => setStatusDialogOpen(false)}
            onConfirm={handleStatusConfirm}
            dialogTitle={`${selectedTenant.isActive ? 'Désactiver' : 'Activer'} le locataire "${selectedTenant.name}"`}
            dialogDescription={selectedTenant.isActive 
              ? 'La désactivation du locataire empêchera tous les utilisateurs associés de se connecter.' 
              : 'L\'activation du locataire permettra aux utilisateurs associés de se connecter.'}
          />
          <PaymentStatusDialog
            tenant={selectedTenant}
            isOpen={paymentStatusDialogOpen}
            onClose={() => setPaymentStatusDialogOpen(false)}
            onConfirm={handlePaymentStatusConfirm}
          />
        </>
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Locataires</h1>
        <Button asChild>
          <Link href="/admin/tenants/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau Locataire
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg border-b border-gray-200 pb-4">
          <CardTitle className="text-xl text-gray-800 flex items-center">
            <span>Locataires</span>
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {extendedTenants.length}
            </span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Liste de tous les locataires dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des locataires...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              Une erreur est survenue lors du chargement des locataires.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4"
                onClick={() => fetchTenants()}
              >
                Réessayer
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Nom</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="text-center font-semibold">Statut</TableHead>
                  <TableHead className="text-center font-semibold">Statut Paiement</TableHead>
                  <TableHead className="text-center font-semibold">Expiration</TableHead>
                  <TableHead className="text-center font-semibold">Utilisateurs</TableHead>
                  <TableHead className="text-center font-semibold">Clients</TableHead>
                  <TableHead className="font-semibold">Date de Création</TableHead>
                  <TableHead className="text-center font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extendedTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Aucun locataire trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  extendedTenants.map((tenant) => (
                    <TableRow key={tenant.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell className="text-gray-600">{tenant.description || '-'}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {tenant.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 py-1 h-auto"
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setPaymentStatusDialogOpen(true);
                          }}
                        >
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusInfo(tenant.paymentStatus).color}`}>
                            {getPaymentStatusInfo(tenant.paymentStatus).label}
                          </span>
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        {tenant.subscriptionEnd ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            new Date(tenant.subscriptionEnd) < new Date() 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {formatDate(tenant.subscriptionEnd)}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tenant.userCount || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {tenant.clientCount || 0}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${tenant.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}
                            title={tenant.isActive ? 'Désactiver' : 'Activer'}
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setStatusDialogOpen(true);
                            }}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-500 hover:text-blue-700"
                            title="Modifier"
                            asChild
                          >
                            <Link href={`/admin/tenants/edit/${tenant.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-amber-500 hover:text-amber-700"
                            title="Abonnement"
                            asChild
                          >
                            <Link href={`/admin/tenants/subscription/${tenant.id}`}>
                              <Calendar className="h-4 w-4" />
                            </Link>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-purple-500 hover:text-purple-700"
                            title="Modifier le statut de paiement"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setPaymentStatusDialogOpen(true);
                            }}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          
                          <DeleteDialog
                            title="Confirmer la suppression"
                            description={`Êtes-vous sûr de vouloir supprimer le locataire "${tenant.name}" ?`}
                            itemName={tenant.name}
                            trigger={
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                            onDelete={async () => {
                              try {
                                await tenantsApi.delete(tenant.id);
                                toast.success(`Locataire "${tenant.name}" supprimé avec succès`);
                                // Refresh the list
                                fetchTenants();
                              } catch (error) {
                                console.error(`Error deleting tenant with ID ${tenant.id}:`, error);
                                toast.error(`Erreur lors de la suppression du locataire "${tenant.name}"`);
                                throw error; // Rethrow to let DeleteDialog handle the error state
                              }
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
