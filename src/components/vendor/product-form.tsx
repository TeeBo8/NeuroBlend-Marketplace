'use client';

import { useState } from 'react';
import {
  Loader2,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRODUCT_CATEGORIES, ROAST_LEVELS } from '@/lib/constants';
import { ImageUpload } from '@/components/vendor/image-upload';

export type ProductFormData = {
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  capsuleCount: number;
  category?: 'HPI' | 'ADHD' | 'hypersensitive';
  imageUrl?: string;
  stock: number;
  intensityLevel?: number;
  roastLevel?: 'light' | 'medium' | 'dark';
  flavorNotes?: string[];
  origin?: string;
};

type ProductFormProps = {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  isPending: boolean;
  submitLabel: string;
};

export function ProductForm({
  initialData,
  onSubmit,
  isPending,
  submitLabel,
}: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || ''
  );
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialData?.compareAtPrice?.toString() || ''
  );
  const [capsuleCount, setCapsuleCount] = useState(
    initialData?.capsuleCount?.toString() || '10'
  );
  const [category, setCategory] = useState(initialData?.category || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [stock, setStock] = useState(initialData?.stock?.toString() || '0');
  const [intensityLevel, setIntensityLevel] = useState(
    initialData?.intensityLevel?.toString() || ''
  );
  const [roastLevel, setRoastLevel] = useState(initialData?.roastLevel || '');
  const [flavorNotesInput, setFlavorNotesInput] = useState(
    initialData?.flavorNotes?.join(', ') || ''
  );
  const [origin, setOrigin] = useState(initialData?.origin || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: ProductFormData = {
      name: name.trim(),
      price: parseFloat(price),
      capsuleCount: parseInt(capsuleCount) || 10,
      stock: parseInt(stock) || 0,
    };

    if (description.trim()) data.description = description.trim();
    if (shortDescription.trim()) data.shortDescription = shortDescription.trim();
    if (compareAtPrice) data.compareAtPrice = parseFloat(compareAtPrice);
    if (category) data.category = category as ProductFormData['category'];
    if (imageUrl.trim()) data.imageUrl = imageUrl.trim();
    if (intensityLevel) data.intensityLevel = parseInt(intensityLevel);
    if (roastLevel) data.roastLevel = roastLevel as ProductFormData['roastLevel'];
    if (flavorNotesInput.trim()) {
      data.flavorNotes = flavorNotesInput
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean);
    }
    if (origin.trim()) data.origin = origin.trim();

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nom du produit <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Capsule Focus Intense"
              required
              minLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">
              Description courte{' '}
              <span className="text-muted-foreground">(max 200 caractères)</span>
            </Label>
            <Input
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Une phrase qui résume votre produit"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description détaillée</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre produit en détail : profil gustatif, bienfaits, conseils de préparation..."
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Stock */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Prix et stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Prix (EUR) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="12.90"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Prix barré (EUR)</Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="15.90"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock disponible</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capsuleCount">Nombre de capsules</Label>
              <Input
                id="capsuleCount"
                type="number"
                min="1"
                value={capsuleCount}
                onChange={(e) => setCapsuleCount(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category & Characteristics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Caractéristiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roastLevel">Niveau de torréfaction</Label>
              <Select value={roastLevel} onValueChange={setRoastLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  {ROAST_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intensityLevel">
                Intensité (1-10)
              </Label>
              <Input
                id="intensityLevel"
                type="number"
                min="1"
                max="10"
                value={intensityLevel}
                onChange={(e) => setIntensityLevel(e.target.value)}
                placeholder="7"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin">Origine</Label>
              <Input
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Ex: Éthiopie, Colombie..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="flavorNotes">
              Notes gustatives{' '}
              <span className="text-muted-foreground">(séparées par des virgules)</span>
            </Label>
            <Input
              id="flavorNotes"
              value={flavorNotesInput}
              onChange={(e) => setFlavorNotesInput(e.target.value)}
              placeholder="Chocolat, Noisette, Fruits rouges"
            />
            {flavorNotesInput && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {flavorNotesInput
                  .split(',')
                  .map((n) => n.trim())
                  .filter(Boolean)
                  .map((note, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                    >
                      {note}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Image</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isPending || !name.trim() || !price}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
