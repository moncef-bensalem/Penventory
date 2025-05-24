'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarIcon, Tag } from 'lucide-react';

export default function NewPromotion() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    startDate: new Date(),
    endDate: new Date(),
    minPurchase: '',
    maxUses: '',
    description: ''
  });

  // Ces données seront remplacées par les vraies données de l'API
  const products = [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/seller/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          products: selectedProducts
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la promotion');
      }

      toast.success('Promotion créée avec succès');
      router.push('/seller/dashboard/promotions');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Créer une promotion</h2>
        <p className="text-muted-foreground">
          Configurez une nouvelle promotion pour vos produits
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Code promo
                </label>
                <div className="relative">
                  <Input
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      code: e.target.value.toUpperCase() 
                    })}
                    placeholder="ex: SUMMER2025"
                    className="uppercase"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Type de réduction
                </label>
                <Select
                  required
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Pourcentage (%)</SelectItem>
                    <SelectItem value="FIXED">Montant fixe (DT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Valeur de la réduction
                </label>
                <div className="relative">
                  <Input
                    required
                    type="number"
                    min={0}
                    max={formData.type === 'PERCENTAGE' ? 100 : undefined}
                    step={formData.type === 'PERCENTAGE' ? 1 : 0.01}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'PERCENTAGE' ? '10' : '20.00'}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                    {formData.type === 'PERCENTAGE' ? '%' : 'DT'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Commande minimum (DT)
                </label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre d'utilisations maximum
                </label>
                <Input
                  type="number"
                  min={0}
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="Illimité si vide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Période de validité
                </label>
                <div className="flex gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'justify-start text-left font-normal',
                          !formData.startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? (
                          format(formData.startDate, 'PPP', { locale: fr })
                        ) : (
                          <span>Date de début</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => setFormData({ ...formData, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'justify-start text-left font-normal',
                          !formData.endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? (
                          format(formData.endDate, 'PPP', { locale: fr })
                        ) : (
                          <span>Date de fin</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => setFormData({ ...formData, endDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Produits applicables
              </label>
              <Select
                value={selectedProducts}
                onValueChange={setSelectedProducts}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez les produits" />
                </SelectTrigger>
                <SelectContent>
                  {products.length === 0 ? (
                    <SelectItem value="" disabled>
                      Aucun produit disponible
                    </SelectItem>
                  ) : (
                    products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                Laissez vide pour appliquer à tous les produits
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/seller/dashboard/promotions')}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer la promotion'}
          </Button>
        </div>
      </form>
    </div>
  );
}
