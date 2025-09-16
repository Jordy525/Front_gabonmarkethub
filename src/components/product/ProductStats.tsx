import React, { useState, useEffect } from 'react';
import { Eye, Heart, Share2, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { analyticsService, ProductStats as ProductStatsType } from '@/services/analyticsService';

interface ProductStatsProps {
  productId: number;
  showDetails?: boolean;
}

export const ProductStats: React.FC<ProductStatsProps> = ({
  productId,
  showDetails = false
}) => {
  const [stats, setStats] = useState<ProductStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsService.getProductStats(productId, period);
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [productId, period]);

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d': return '7 derniers jours';
      case '30d': return '30 derniers jours';
      case '90d': return '90 derniers jours';
      default: return '30 derniers jours';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Statistiques du produit
        </h3>
        
        {showDetails && (
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="7d">7 jours</option>
            <option value="30d">30 jours</option>
            <option value="90d">90 jours</option>
          </select>
        )}
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-900">
            {formatNumber(stats.stats.total_vues)}
          </div>
          <div className="text-sm text-blue-700">Vues</div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-900">
            {formatNumber(stats.stats.total_clics)}
          </div>
          <div className="text-sm text-green-700">Clics</div>
        </div>

        <div className="text-center p-4 bg-red-50 rounded-lg">
          <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-900">
            {formatNumber(stats.stats.total_favoris)}
          </div>
          <div className="text-sm text-red-700">Favoris</div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Share2 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-900">
            {formatNumber(stats.stats.total_partages)}
          </div>
          <div className="text-sm text-purple-700">Partages</div>
        </div>
      </div>

      {/* Informations du produit */}
      {stats.product && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Informations du produit</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Vues (30j):</span>
                <span className="font-medium">{formatNumber(stats.product.vues_30j)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Score popularité:</span>
                <span className="font-medium">{Number(stats.product.score_popularite || 0).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Note moyenne:</span>
                <span className="font-medium">{Number(stats.product.note_moyenne || 0).toFixed(1)}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre d'avis:</span>
                <span className="font-medium">{stats.product.nombre_avis}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Période: {getPeriodLabel(period)}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total vues:</span>
                <span className="font-medium">{formatNumber(stats.stats.total_vues)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total clics:</span>
                <span className="font-medium">{formatNumber(stats.stats.total_clics)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total favoris:</span>
                <span className="font-medium">{formatNumber(stats.stats.total_favoris)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total partages:</span>
                <span className="font-medium">{formatNumber(stats.stats.total_partages)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graphique des statistiques quotidiennes */}
      {showDetails && stats.dailyStats.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Évolution quotidienne
          </h4>
          
          <div className="space-y-3">
            {stats.dailyStats.slice(0, 7).map((day, index) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </div>
                
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{day.vues}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{day.clics}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-600" />
                    <span className="text-sm">{day.ajouts_favoris}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">{day.partages}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dernière activité */}
      {stats.product?.derniere_activite && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Dernière activité: {new Date(stats.product.derniere_activite).toLocaleString('fr-FR')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductStats;
