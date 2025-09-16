# Système de Catégories - GabMarketHub

Ce dossier contient tous les composants et utilitaires pour la gestion et l'affichage des catégories dans l'application GabMarketHub.

## 🎯 Vue d'ensemble

Le système de catégories offre **3 techniques d'affichage optimales** pour une navigation intuitive côté acheteur :

1. **MegaMenu** - Menu déroulant riche dans le header
2. **Sidebar** - Navigation latérale avec filtres
3. **Pages dédiées** - Vues complètes avec recherche avancée

## 📁 Structure des composants

### Composants principaux

- **`MegaMenu.tsx`** - Menu déroulant avancé pour le header
- **`CategorySidebar.tsx`** - Sidebar de navigation avec filtres
- **`CategoryCard.tsx`** - Carte de catégorie réutilisable (3 variantes)
- **`CategoryFilters.tsx`** - Système de filtres avancés
- **`CategoryBreadcrumb.tsx`** - Fil d'Ariane pour la navigation
- **`CategoriesMenu.tsx`** - Menu simple (legacy, remplacé par MegaMenu)

### Pages

- **`AllCategories.tsx`** - Page complète avec toutes les catégories
- **`CategoryDetail.tsx`** - Page de détail d'une catégorie

### Utilitaires

- **`types.ts`** - Types TypeScript partagés
- **`utils.ts`** - Fonctions utilitaires pour les catégories
- **`index.ts`** - Exports centralisés

## 🚀 Utilisation

### 1. MegaMenu (Header)

```tsx
import { MegaMenu } from '@/components/categories';

// Dans le Header
<MegaMenu />
```

**Fonctionnalités :**
- Catégories populaires en vedette
- Grille de toutes les catégories principales
- Sous-catégories au survol
- Statistiques en temps réel
- Responsive et accessible

### 2. CategorySidebar (Pages de produits)

```tsx
import { CategorySidebar } from '@/components/categories';

<CategorySidebar
  onCategorySelect={(slug) => handleFilter(slug)}
  showSearch={true}
  showProductCount={true}
  maxDepth={2}
/>
```

**Fonctionnalités :**
- Recherche en temps réel
- Navigation hiérarchique
- Compteurs de produits
- Filtres actifs
- État collapsible

### 3. Pages dédiées

```tsx
import AllCategories from '@/pages/AllCategories';
import CategoryDetail from '@/pages/CategoryDetail';

// Routes
<Route path="/categories" element={<AllCategories />} />
<Route path="/categories/:slug" element={<CategoryDetail />} />
```

**Fonctionnalités :**
- Recherche et filtres avancés
- Tri multiple (nom, popularité, produits)
- Vues grille/liste
- Catégories en vedette
- Statistiques détaillées

## 🎨 Variantes de CategoryCard

### Default
```tsx
<CategoryCard category={category} onClick={handleClick} />
```

### Compact (pour listes)
```tsx
<CategoryCard 
  category={category} 
  onClick={handleClick}
  variant="compact" 
/>
```

### Featured (mise en avant)
```tsx
<CategoryCard 
  category={category} 
  onClick={handleClick}
  variant="featured"
  showProductCount={true}
/>
```

## 🛠️ Utilitaires disponibles

```tsx
import {
  buildCategoryHierarchy,
  findCategoryBySlug,
  buildCategoryBreadcrumb,
  filterCategories,
  sortCategories,
  getTotalSubcategories,
  getPopularCategories,
  getCategoryColor
} from '@/components/categories/utils';

// Organiser les catégories en hiérarchie
const hierarchy = buildCategoryHierarchy(flatCategories);

// Construire le breadcrumb
const breadcrumb = buildCategoryBreadcrumb(categories, 'electronics');

// Filtrer par recherche
const filtered = filterCategories(categories, 'ordinateur');
```

## 📊 Types de données

```typescript
interface Category {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  parent_id?: number;
  ordre: number;
  children?: Category[];
  productCount?: number;
}
```

## 🎯 Fonctionnalités clés

### Navigation intelligente
- **Catégories avec enfants** → Redirection vers `/categories/:slug`
- **Catégories finales** → Redirection vers `/products?category=:slug`

### Recherche avancée
- Recherche dans les noms et descriptions
- Recherche dans les sous-catégories
- Filtres par type (avec/sans sous-catégories)
- Tri multiple

### Performance
- Cache des requêtes (5 minutes)
- Lazy loading des sous-catégories
- Optimisation des re-rendus
- Pagination automatique

### Accessibilité
- Navigation au clavier
- ARIA labels appropriés
- Contrastes respectés
- Focus management

## 🔧 Configuration

### API Endpoints requis
- `GET /categories` - Liste toutes les catégories
- `GET /categories/:slug` - Détails d'une catégorie

### Structure de réponse attendue
```json
{
  "categories": [
    {
      "id": 1,
      "nom": "Électronique",
      "slug": "electronique",
      "description": "Produits électroniques",
      "parent_id": null,
      "ordre": 1,
      "productCount": 150
    }
  ]
}
```

## 🎨 Personnalisation

### Couleurs des catégories
Modifiez `getCategoryColor()` dans `utils.ts` pour personnaliser les couleurs.

### Icônes
Personnalisez les icônes dans `CategoryCard.tsx` selon vos besoins.

### Animations
Les transitions sont configurées avec Tailwind CSS et peuvent être ajustées.

## 📱 Responsive Design

Tous les composants sont entièrement responsive :
- **Mobile** : Navigation simplifiée, menus collapsibles
- **Tablet** : Grilles adaptatives, sidebar optionnelle  
- **Desktop** : Expérience complète avec MegaMenu

## 🚀 Performance

- **Lazy loading** des images et composants
- **Memoization** des calculs coûteux
- **Debouncing** des recherches
- **Cache intelligent** des requêtes API

## 🔄 Évolutions futures

- [ ] Catégories favorites utilisateur
- [ ] Suggestions basées sur l'historique
- [ ] Analytics des catégories populaires
- [ ] Support multilingue
- [ ] Catégories dynamiques par région