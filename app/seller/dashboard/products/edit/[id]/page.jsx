'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Upload, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

export default function EditProduct({ params }) {
  const router = useRouter();
  const productId = use(params).id;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Product attribute options
  const colors = [
    { id: 'Undefined', name: 'Undefined' },
    { id: 'Multi Color', name: 'Multi Color' },
    { id: 'Red', name: 'Red' },
    { id: 'Green', name: 'Green' },
    { id: 'Blue', name: 'Blue' },
    { id: 'Yellow', name: 'Yellow' },
    { id: 'Orange', name: 'Orange' },
    { id: 'Purple', name: 'Purple' },
    { id: 'Pink', name: 'Pink' },
    { id: 'Brown', name: 'Brown' },
    { id: 'Gray', name: 'Gray' },
    { id: 'Black', name: 'Black' },
    { id: 'White', name: 'White' },
    { id: 'Cyan', name: 'Cyan' },
    { id: 'Magenta', name: 'Magenta' },
    { id: 'Lime', name: 'Lime' },
    { id: 'Violet', name: 'Violet' },
    { id: 'Teal', name: 'Teal' },
    { id: 'Turquoise', name: 'Turquoise' },
    { id: 'Maroon', name: 'Maroon' },
    { id: 'Beige', name: 'Beige' },
  ];
  
  const sizes = [
    { id: 'Undefined', name: 'Undefined' },
    { id: 'Small', name: 'Small' },
    { id: 'Medium', name: 'Medium' },
    { id: 'Big/Large', name: 'Big/Large' },
  ];
  
  const materials = [
    { id: 'Undefined', name: 'Undefined' },
    { id: 'Paper', name: 'Paper' },
    { id: 'Plastic', name: 'Plastic' },
    { id: 'Wood', name: 'Wood' },
    { id: 'Rubber', name: 'Rubber' },
    { id: 'Leather', name: 'Leather' },
    { id: 'Fabric', name: 'Fabric' },
    { id: 'Glass', name: 'Glass' },
    { id: 'Ink', name: 'Ink' },
    { id: 'Adhesive', name: 'Adhesive' },
    { id: 'Cardboard', name: 'Cardboard' },
    { id: 'Metal', name: 'Metal' },
    { id: 'Foam', name: 'Foam' },
    { id: 'Bamboo', name: 'Bamboo' },
  ];
  
  const dimensions = [
    { id: 'Undefined', name: 'Undefined' },
    { id: 'Normal', name: 'Normal' },
    { id: 'TP', name: 'TP' },
    { id: 'Recitation', name: 'Recitation' },
    { id: 'Music', name: 'Music' },
    { id: 'Dessin', name: 'Dessin' },
    { id: 'Spiral', name: 'Spiral' },
    { id: '5x5', name: '5x5' },
    { id: '10x10', name: '10x10' },
    { id: 'Register', name: 'Register' },
    { id: 'Diary', name: 'Diary' }
  ];
  
  const languages = [
    { id: 'Undefined', name: 'Undefined', abbreviation: 'UNDIFINED' },
    { id: 'Arabic', name: 'Arabic', abbreviation: 'AR' },
    { id: 'French', name: 'French', abbreviation: 'FR' },
    { id: 'English', name: 'English', abbreviation: 'EN' },
    { id: 'Spanish', name: 'Spanish', abbreviation: 'ES' },
    { id: 'Italian', name: 'Italian', abbreviation: 'IT' },
    { id: 'German', name: 'German', abbreviation: 'DE' }
  ];
  
  const classLevels = [
    { id: 'Undefined', name: 'Undefined', level: '' },
    { id: 'Level 1', name: 'Level 1', level: 'Primary' },
    { id: 'Level 2', name: 'Level 2', level: 'Primary' },
    { id: 'Level 3', name: 'Level 3', level: 'Primary' },
    { id: 'Level 4', name: 'Level 4', level: 'Primary' },
    { id: 'Level 5', name: 'Level 5', level: 'Primary' },
    { id: 'Level 6', name: 'Level 6', level: 'Primary' },
    { id: 'Level 7', name: 'Level 7', level: 'Intermediate' },
    { id: 'Level 8', name: 'Level 8', level: 'Intermediate' },
    { id: 'Level 9', name: 'Level 9', level: 'Intermediate' },
    { id: 'Level 1 S.', name: 'Level 1 S.', level: 'Secondary' },
    { id: 'Level 2 S.', name: 'Level 2 S.', level: 'Secondary' },
    { id: 'Level 3 S.', name: 'Level 3 S.', level: 'Secondary' },
    { id: 'BAC', name: 'BAC', level: 'Secondary' },
    { id: 'License', name: 'License', level: 'University' },
    { id: 'Master', name: 'Master', level: 'University' },
    { id: 'Doctorate', name: 'Doctorate', level: 'University' }
  ];
  
  // Group class levels by educational level
  const groupedClassLevels = [];
  const levels = [...new Set(classLevels.map((cls) => cls.level))];
  
  levels.forEach((level) => {
    if (level) {
      groupedClassLevels.push({ id: `group-${level}`, name: `--- ${level} ---`, disabled: true });
      classLevels
        .filter((cls) => cls.level === level)
        .forEach((cls) => groupedClassLevels.push(cls));
    }
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    
    // Nouveaux champs
    barcode: '',
    discount: '',
    isWholesale: false,
    wholesalePrice: '',
    wholesaleMinQty: '',
    isActive: true,
    
    // Attributs produit
    brand: '',
    color: '',
    material: '',
    size: '',
    
    // Options pour produits papier
    dimensions: '',
    pages: '',
    
    // Options pour livres
    level: '',
    collection: '',
    author: '',
    language: ''
  });
  
  // État pour gérer les tags
  const [tags, setTags] = useState([]);

  // Charger les données du produit et les catégories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        
        // Récupérer les catégories
        const categoriesResponse = await fetch('/api/seller/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Erreur lors du chargement des catégories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        
        // Récupérer les détails du produit
        const productResponse = await fetch(`/api/seller/products?id=${productId}`);
        if (!productResponse.ok) {
          throw new Error('Erreur lors du chargement du produit');
        }
        
        const response = await productResponse.json();
        console.log('Réponse complète de l\'API:', JSON.stringify(response, null, 2));
        
        // Extraire les données du produit de la réponse
        let productData;
        if (response.product) {
          // L'API renvoie les données du produit dans un objet { product: ... }
          productData = response.product;
          console.log('Données du produit extraites de response.product:', productData);
        } else {
          // Si la structure est différente, utiliser directement la réponse
          productData = response;
          console.log('Structure différente, utilisation directe de la réponse');
        }
        
        // Log pour débogage
        console.log('Valeurs utilisées pour le formulaire:');
        console.log('Nom:', productData.name);
        console.log('Description:', productData.description);
        console.log('Prix:', productData.price);
        console.log('Stock:', productData.stock);
        console.log('Catégorie:', productData.categoryId);
        console.log('Tags:', productData.tags);
        
        // Mettre à jour le formulaire avec les données du produit
        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price?.toString() || '',
          stock: productData.stock?.toString() || '',
          categoryId: productData.categoryId || '',
          
          // Nouveaux champs
          barcode: productData.barcode || '',
          discount: productData.discount?.toString() || '',
          isWholesale: productData.isWholesale || false,
          wholesalePrice: productData.wholesalePrice?.toString() || '',
          wholesaleMinQty: productData.wholesaleMinQty?.toString() || '',
          isActive: productData.isActive !== undefined ? productData.isActive : true,
          
          // Attributs produit
          brand: productData.brand || '',
          color: productData.color || '',
          material: productData.material || '',
          size: productData.size || '',
          
          // Options pour produits papier
          dimensions: productData.dimensions || '',
          pages: productData.pages?.toString() || '',
          
          // Options pour livres
          level: productData.level || '',
          collection: productData.collection || '',
          author: productData.author || '',
          language: productData.language || ''
        });
        
        // Mettre à jour les tags
        if (productData.tags && Array.isArray(productData.tags)) {
          setTags(productData.tags);
        }
        
        // Mettre à jour les images
        if (productData.images && productData.images.length > 0) {
          setImages(productData.images);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error(error.message);
      } finally {
        setInitialLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(newImages => {
      setImages(prevImages => [...prevImages, ...newImages]);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/seller/products?id=${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images,
          tags, // Inclure les tags dans les données envoyées
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du produit');
      }

      toast.success('Produit mis à jour avec succès');
      router.push('/seller/dashboard/products');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ouvrir la boîte de dialogue de suppression
  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  // Fonction pour supprimer un produit
  const handleDelete = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/seller/products?id=${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la suppression du produit');
          } catch (jsonError) {
            // Si l'analyse JSON échoue, utiliser le texte brut ou un message par défaut
            const errorText = await response.text();
            throw new Error(errorText || `Erreur ${response.status}: ${response.statusText}`);
          }
        } else {
          // Si la réponse n'est pas du JSON, utiliser le texte brut
          const errorText = await response.text();
          throw new Error(errorText || `Erreur ${response.status}: ${response.statusText}`);
        }
      }

      toast.success('Produit supprimé avec succès');
      router.push('/seller/dashboard/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
          <p className="text-muted-foreground">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/seller/dashboard/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Modifier le produit</h2>
          <p className="text-muted-foreground">
            Modifiez les informations de votre produit
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Images du produit
              </label>
              <div className="flex flex-wrap gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                  <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Ajouter</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nom du produit
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom du produit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Catégorie
                </label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Prix (DT)
                </label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Stock
                </label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée du produit"
                rows={5}
              />
            </div>
            
            {/* Code-barres et remise */}
            <div className="grid gap-4 md:grid-cols-2 mt-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Code-barres
                </label>
                <Input
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Code-barres du produit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Remise (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="Remise en pourcentage"
                />
              </div>
            </div>
            
            {/* Tags */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((_, i) => i !== index))}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un tag"
                  id="tagInput"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      if (value && !tags.includes(value)) {
                        setTags([...tags, value]);
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById('tagInput');
                    const value = input.value.trim();
                    if (value && !tags.includes(value)) {
                      setTags([...tags, value]);
                      input.value = '';
                    }
                  }}
                >
                  Ajouter
                </Button>
              </div>
            </div>
            
            {/* Options de vente en gros */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="isWholesale"
                  checked={formData.isWholesale}
                  onChange={(e) => setFormData({ ...formData, isWholesale: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="isWholesale" className="text-sm font-medium">
                  Disponible en vente en gros
                </label>
              </div>
              
              {formData.isWholesale && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Prix de gros (DT)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.wholesalePrice}
                      onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quantité minimale
                    </label>
                    <Input
                      type="number"
                      min="2"
                      value={formData.wholesaleMinQty}
                      onChange={(e) => setFormData({ ...formData, wholesaleMinQty: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Statut du produit */}
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Produit actif (visible pour les clients)
                </label>
              </div>
            </div>
            
            {/* Attributs produit */}
            <div className="mt-6">
              <h4 className="text-md font-medium mb-3">✉️ Attributs produit</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Marque
                  </label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Marque du produit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Couleur
                  </label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData({ ...formData, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une couleur" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map(color => (
                        <SelectItem key={color.id} value={color.id}>{color.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Matériau
                  </label>
                  <Select
                    value={formData.material}
                    onValueChange={(value) => setFormData({ ...formData, material: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un matériau" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map(material => (
                        <SelectItem key={material.id} value={material.id}>{material.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Taille
                  </label>
                  <Select
                    value={formData.size}
                    onValueChange={(value) => setFormData({ ...formData, size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une taille" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map(size => (
                        <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Options pour produits papier */}
            <div className="mt-6">
              <h4 className="text-md font-medium mb-3">📃 Options pour papeterie</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dimensions
                  </label>
                  <Select
                    value={formData.dimensions}
                    onValueChange={(value) => setFormData({ ...formData, dimensions: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une dimension" />
                    </SelectTrigger>
                    <SelectContent>
                      {dimensions.map(dimension => (
                        <SelectItem key={dimension.id} value={dimension.id}>{dimension.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre de pages
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                    placeholder="Nombre de pages"
                  />
                </div>
              </div>
            </div>
            
            {/* Options pour livres et histoires */}
            <div className="mt-6">
              <h4 className="text-md font-medium mb-3">📚 Options pour livres et histoires</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Niveau scolaire
                  </label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {classLevels.map(level => (
                        <SelectItem 
                          key={level.id} 
                          value={level.id}
                        >
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Collection
                  </label>
                  <Input
                    value={formData.collection}
                    onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                    placeholder="Collection du livre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Auteur
                  </label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Auteur du livre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Langue
                  </label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(language => (
                        <SelectItem key={language.id} value={language.id}>{language.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/seller/dashboard/products')}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Mise à jour...' : 'Mettre à jour le produit'}
          </Button>
          <Button type="button" variant="danger" onClick={openDeleteDialog}>
            Supprimer le produit
          </Button>
        </div>
      </form>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le produit</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
          </DialogDescription>
          <DialogFooter>
            <Button variant="danger" onClick={handleDelete}>
              Supprimer
            </Button>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
