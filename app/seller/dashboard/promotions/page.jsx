'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
  Percent,
  Tag,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function PromotionsPage() {
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [stats, setStats] = useState({
    totalPromotions: 0,
    activePromotions: 0,
    usageCount: 0,
    revenue: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    minPurchase: '',
    maxUses: '',
    startDate: '',
    endDate: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchPromotions();
  }, [pagination.page, search, sortField, sortOrder]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortField,
        sortOrder
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/seller/promotions?${params.toString()}`);
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la récupération des promotions');
        } else {
          const errorText = await response.text();
          throw new Error(errorText || `Erreur ${response.status}: ${response.statusText}`);
        }
      }

      // Vérifier si la réponse n'est pas vide
      const responseText = await response.text();
      if (!responseText.trim()) {
        throw new Error('Réponse vide du serveur');
      }

      // Parser le JSON manuellement
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError, 'Réponse:', responseText);
        throw new Error('Erreur lors du parsing de la réponse');
      }

      setPromotions(data.promotions || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      setStats(data.stats || { totalPromotions: 0, activePromotions: 0, usageCount: 0, revenue: 0 });
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Erreur lors du chargement des promotions');
      // Réinitialiser les données en cas d'erreur
      setPromotions([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
      setStats({ totalPromotions: 0, activePromotions: 0, usageCount: 0, revenue: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchPromotions();
  };

  const handleSort = (field) => {
    const newSortOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PP', { locale: fr });
  };

  const openCreateDialog = () => {
    setEditMode(false);
    setCurrentPromotion(null);
    setFormData({
      code: '',
      type: 'PERCENTAGE',
      value: '',
      minPurchase: '',
      maxUses: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
      description: '',
      isActive: true
    });
    setDialogOpen(true);
  };

  const openEditDialog = (promotion) => {
    setEditMode(true);
    setCurrentPromotion(promotion);
    setFormData({
      code: promotion.code,
      type: promotion.type,
      value: promotion.value.toString(),
      minPurchase: promotion.minPurchase?.toString() || '',
      maxUses: promotion.maxUses?.toString() || '',
      startDate: format(new Date(promotion.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(promotion.endDate), 'yyyy-MM-dd'),
      description: promotion.description || '',
      isActive: promotion.isActive
    });
    setDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validation
      if (!formData.code.trim()) {
        toast.error('Le code de promotion est requis');
        return;
      }

      if (!formData.value || isNaN(parseFloat(formData.value)) || parseFloat(formData.value) <= 0) {
        toast.error('La valeur de la promotion doit être un nombre positif');
        return;
      }

      if (formData.type === 'PERCENTAGE' && parseFloat(formData.value) > 100) {
        toast.error('Le pourcentage ne peut pas dépasser 100%');
        return;
      }

      if (formData.minPurchase && (isNaN(parseFloat(formData.minPurchase)) || parseFloat(formData.minPurchase) < 0)) {
        toast.error('Le montant minimum d\'achat doit être un nombre positif');
        return;
      }

      if (formData.maxUses && (isNaN(parseInt(formData.maxUses)) || parseInt(formData.maxUses) < 0)) {
        toast.error('Le nombre maximum d\'utilisations doit être un nombre entier positif');
        return;
      }

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (startDate >= endDate) {
        toast.error('La date de fin doit être postérieure à la date de début');
        return;
      }

      // Préparer les données
      const promotionData = {
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description.trim(),
        isActive: formData.isActive
      };

      const url = '/api/seller/promotions';
      const method = editMode ? 'PUT' : 'POST';
      
      if (editMode) {
        promotionData.id = currentPromotion.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promotionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Une erreur est survenue');
      }

      toast.success(editMode ? 'Promotion mise à jour avec succès' : 'Promotion créée avec succès');
      setDialogOpen(false);
      fetchPromotions();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Erreur lors de l\'enregistrement de la promotion');
    }
  };

  const handleDelete = async (promotionId) => {
    if (!promotionId) {
      setDeleteDialogOpen(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/seller/promotions?id=${promotionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression de la promotion');
      }

      toast.success('Promotion supprimée avec succès');
      fetchPromotions();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la promotion');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setPromotionToDelete(null);
    }
  };

  const getPromotionStatus = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (!promotion.isActive) {
      return { status: 'inactive', label: 'Inactive', variant: 'outline' };
    } else if (now < startDate) {
      return { status: 'scheduled', label: 'Programmée', variant: 'secondary' };
    } else if (now > endDate) {
      return { status: 'expired', label: 'Expirée', variant: 'destructive' };
    } else {
      return { status: 'active', label: 'Active', variant: 'default' };
    }
  };

  if (loading && promotions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Promotions</h2>
        <p className="text-muted-foreground">
          Créez et gérez des codes promotionnels pour vos clients
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total promotions
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {stats.totalPromotions}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <Tag className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Promotions actives
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {stats.activePromotions}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Utilisations
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {stats.usageCount}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Chiffre d'affaires généré
              </p>
              <h3 className="text-2xl font-bold mt-2">
                {stats.revenue.toFixed(2)} DT
              </h3>
            </div>
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/20">
              <Percent className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <form onSubmit={handleSearch} className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une promotion..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </form>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle promotion
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Utilisations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Tag className="h-10 w-10 mb-2" />
                        <p>Aucune promotion trouvée</p>
                        <Button 
                          variant="link" 
                          onClick={openCreateDialog}
                          className="mt-2"
                        >
                          Créer une promotion
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  promotions.map((promotion) => {
                    const status = getPromotionStatus(promotion);
                    return (
                      <TableRow key={promotion.id}>
                        <TableCell className="font-medium">
                          {promotion.code}
                        </TableCell>
                        <TableCell>
                          {promotion.type === 'PERCENTAGE' ? 'Pourcentage' : 'Montant fixe'}
                        </TableCell>
                        <TableCell>
                          {promotion.type === 'PERCENTAGE' 
                            ? `${promotion.value}%` 
                            : `${promotion.value.toFixed(2)} DT`}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(promotion.startDate)}</div>
                            <div className="text-muted-foreground">à</div>
                            <div>{formatDate(promotion.endDate)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {promotion.usageCount || 0}
                          {promotion.maxUses && ` / ${promotion.maxUses}`}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openEditDialog(promotion)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setDeleteDialogOpen(true);
                                setPromotionToDelete(promotion);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Affichage de {(pagination.page - 1) * pagination.limit + 1} à{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} sur{' '}
                {pagination.total} promotions
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Dialogue de création/édition de promotion */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editMode ? 'Modifier la promotion' : 'Créer une nouvelle promotion'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  Code
                </Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="SUMMER2025"
                  disabled={editMode}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Pourcentage (%)</SelectItem>
                    <SelectItem value="FIXED">Montant fixe (DT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Valeur
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    value={formData.value}
                    onChange={handleInputChange}
                    step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                    min={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                    max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                  />
                  <span className="text-muted-foreground">
                    {formData.type === 'PERCENTAGE' ? '%' : 'DT'}
                  </span>
                </div>
              </div>

              <Separator />
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minPurchase" className="text-right">
                  Achat minimum
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="minPurchase"
                    name="minPurchase"
                    type="number"
                    value={formData.minPurchase}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    placeholder="Optionnel"
                  />
                  <span className="text-muted-foreground">DT</span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxUses" className="text-right">
                  Utilisations max.
                </Label>
                <Input
                  id="maxUses"
                  name="maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={handleInputChange}
                  className="col-span-3"
                  min="1"
                  step="1"
                  placeholder="Illimité"
                />
              </div>

              <Separator />
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Date de début
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  Date de fin
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Description de la promotion (optionnel)"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Actif
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive" className="text-sm text-muted-foreground">
                    {formData.isActive ? 'La promotion est active' : 'La promotion est inactive'}
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editMode ? 'Mettre à jour' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              Supprimer la promotion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-lg">
              Êtes-vous sûr de vouloir supprimer la promotion <strong>{promotionToDelete?.code}</strong> ?
            </p>
            <p className="text-muted-foreground">
              Cette action est définitive et ne peut pas être annulée.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={() => handleDelete(promotionToDelete?.id)}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
