import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminNotificationDashboard } from './AdminNotificationDashboard';
import { AdminNotificationBell } from './AdminNotificationBell';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* En-tête avec notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord Admin</h1>
          <p className="text-muted-foreground">
            Gestion et supervision de la plateforme e-commerce
          </p>
        </div>
        <AdminNotificationBell />
      </div>

      {/* Onglets principaux */}
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-6">
          <AdminNotificationDashboard />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface de gestion des utilisateurs en cours de développement...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface de gestion des produits en cours de développement...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface de gestion des commandes en cours de développement...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
