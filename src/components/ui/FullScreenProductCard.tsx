import React, { useState } from 'react';
import { X, Heart, Share2, ShoppingCart, Star, MapPin, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Product {
    id: number;
    nom: string;
    description?: string;
    prix_unitaire: number;
    prix_promo?: number;
    image_principale?: string;
    images?: Array<{ url: string }>;
    note_moyenne?: number;
    nombre_avis?: number;
    stock_disponible?: number;
    fournisseur?: string;
    localisation?: string;
    categorie?: string;
    quantite_minimale?: number;
    unite?: string;
}

interface FullScreenProductCardProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart?: (id: number) => void;
    onToggleFavorite?: (id: number) => void;
    isFavorite?: boolean;
}

export const FullScreenProductCard: React.FC<FullScreenProductCardProps> = ({
    product,
    isOpen,
    onClose,
    onAddToCart,
    onToggleFavorite,
    isFavorite = false
}) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(product.quantite_minimale || 1);

    const images = product.images?.map(img => img.url) ||
        (product.image_principale ? [product.image_principale] : []);

    const hasDiscount = product.prix_promo && product.prix_promo < product.prix_unitaire;
    const displayPrice = hasDiscount ? product.prix_promo : product.prix_unitaire;
    const originalPrice = hasDiscount ? product.prix_unitaire : null;
    const discountPercent = hasDiscount
        ? Math.round(((product.prix_unitaire - product.prix_promo!) / product.prix_unitaire) * 100)
        : 0;

    const rating = product.note_moyenne || 0;
    const reviewCount = product.nombre_avis || 0;
    const isInStock = (product.stock_disponible || 0) > 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden">
                <div className="flex flex-col lg:flex-row h-full">
                    {/* Section Images - RESPONSIVE */}
                    <div className="w-full lg:w-1/2 bg-gray-50">
                        <div className="relative h-64 sm:h-80 lg:h-full">
                            {/* Image principale */}
                            <img
                                src={images[selectedImageIndex] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop'}
                                alt={product.nom}
                                className="w-full h-full object-cover"
                            />

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                {hasDiscount && (
                                    <Badge className="bg-red-500 text-white">
                                        -{discountPercent}%
                                    </Badge>
                                )}
                                {!isInStock && (
                                    <Badge variant="secondary">Rupture de stock</Badge>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="absolute top-3 right-3 flex gap-2">
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="w-8 h-8 sm:w-10 sm:h-10"
                                    onClick={() => onToggleFavorite?.(product.id)}
                                >
                                    <Heart className={cn("w-4 h-4", isFavorite && "fill-red-500 text-red-500")} />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="w-8 h-8 sm:w-10 sm:h-10"
                                >
                                    <Share2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Miniatures */}
                            {images.length > 1 && (
                                <div className="absolute bottom-3 left-3 right-3">
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImageIndex(index)}
                                                className={cn(
                                                    "flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-colors",
                                                    selectedImageIndex === index ? "border-white" : "border-transparent"
                                                )}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${product.nom} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section Détails - RESPONSIVE */}
                    <div className="w-full lg:w-1/2 flex flex-col">
                        {/* Header */}
                        <DialogHeader className="p-4 sm:p-6 border-b">
                            <div className="flex items-start justify-between">
                                <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold line-clamp-2 pr-4">
                                    {product.nom}
                                </DialogTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="flex-shrink-0"
                                >
                                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                            </div>
                        </DialogHeader>

                        {/* Contenu scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            {/* Catégorie */}
                            {product.categorie && (
                                <Badge variant="outline" className="mb-3">
                                    {product.categorie}
                                </Badge>
                            )}

                            {/* Prix */}
                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl sm:text-3xl font-bold text-green-600">
                                        {displayPrice?.toLocaleString()} FCFA
                                    </span>
                                    {originalPrice && (
                                        <span className="text-lg text-gray-500 line-through">
                                            {originalPrice.toLocaleString()} FCFA
                                        </span>
                                    )}
                                </div>
                                {product.quantite_minimale && (
                                    <p className="text-sm text-gray-600">
                                        Quantité minimale: {product.quantite_minimale} {product.unite || 'unité'}
                                    </p>
                                )}
                            </div>

                            {/* Note et avis */}
                            {rating > 0 && (
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn(
                                                    "w-4 h-4 sm:w-5 sm:h-5",
                                                    i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm sm:text-base font-medium">
                                        {rating.toFixed(1)}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        ({reviewCount} avis)
                                    </span>
                                </div>
                            )}

                            {/* Description */}
                            {product.description && (
                                <div className="mb-6">
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>
                            )}

                            {/* Informations fournisseur */}
                            <div className="space-y-3 mb-6">
                                {product.fournisseur && (
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm">
                                            <span className="font-medium">Fournisseur:</span> {product.fournisseur}
                                        </span>
                                    </div>
                                )}
                                {product.localisation && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm">
                                            <span className="font-medium">Localisation:</span> {product.localisation}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">
                                        <span className="font-medium">Stock:</span> {product.stock_disponible || 0} disponible(s)
                                    </span>
                                </div>
                            </div>

                            {/* Sélection quantité */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">
                                    Quantité
                                </label>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setQuantity(Math.max(product.quantite_minimale || 1, quantity - 1))}
                                        disabled={quantity <= (product.quantite_minimale || 1)}
                                    >
                                        -
                                    </Button>
                                    <span className="w-12 text-center font-medium">
                                        {quantity}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setQuantity(quantity + 1)}
                                        disabled={quantity >= (product.stock_disponible || 0)}
                                    >
                                        +
                                    </Button>
                                    <span className="text-sm text-gray-600 ml-2">
                                        {product.unite || 'unité'}(s)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="border-t p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => onToggleFavorite?.(product.id)}
                                >
                                    <Heart className={cn("w-4 h-4 mr-2", isFavorite && "fill-red-500 text-red-500")} />
                                    {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={() => onAddToCart?.(product.id)}
                                    disabled={!isInStock}
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    {isInStock ? 'Ajouter au panier' : 'Indisponible'}
                                </Button>
                            </div>

                            {/* Prix total */}
                            <div className="mt-3 pt-3 border-t">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        Total ({quantity} {product.unite || 'unité'}(s)):
                                    </span>
                                    <span className="text-lg font-bold text-green-600">
                                        {((displayPrice || 0) * quantity).toLocaleString()} FCFA
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FullScreenProductCard;