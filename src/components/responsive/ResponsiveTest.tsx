import { useBreakpoint } from '@/config/responsive';
import { RESPONSIVE_CLASSES } from '@/config/responsive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Laptop,
  Grid3X3,
  List,
  Eye
} from 'lucide-react';

const ResponsiveTest = () => {
  const breakpoint = useBreakpoint();
  
  const breakpointInfo = {
    xs: { label: 'Mobile Portrait', icon: Smartphone, color: 'bg-red-500' },
    sm: { label: 'Mobile Landscape', icon: Smartphone, color: 'bg-orange-500' },
    md: { label: 'Tablet Portrait', icon: Tablet, color: 'bg-yellow-500' },
    lg: { label: 'Desktop Small', icon: Laptop, color: 'bg-green-500' },
    xl: { label: 'Desktop Medium', icon: Monitor, color: 'bg-blue-500' },
    '2xl': { label: 'Desktop Large', icon: Monitor, color: 'bg-purple-500' }
  };

  const currentBreakpoint = breakpointInfo[breakpoint as keyof typeof breakpointInfo];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test du Système Responsive</span>
              <Badge className={currentBreakpoint.color}>
                {currentBreakpoint.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <currentBreakpoint.icon className="w-5 h-5" />
              <span>Breakpoint actuel: <strong>{breakpoint}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Test des grilles */}
        <Card>
          <CardHeader>
            <CardTitle>Test des Grilles Responsives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Grille 1 colonne */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Grille 1 colonne</h3>
              <div className={RESPONSIVE_CLASSES.grid1}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-blue-200 p-4 rounded text-center">
                    Item {i}
                  </div>
                ))}
              </div>
            </div>

            {/* Grille 2 colonnes */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Grille 2 colonnes</h3>
              <div className={RESPONSIVE_CLASSES.grid2}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-green-200 p-4 rounded text-center">
                    Item {i}
                  </div>
                ))}
              </div>
            </div>

            {/* Grille 3 colonnes */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Grille 3 colonnes</h3>
              <div className={RESPONSIVE_CLASSES.grid3}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-purple-200 p-4 rounded text-center">
                    Item {i}
                  </div>
                ))}
              </div>
            </div>

            {/* Grille 4 colonnes */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Grille 4 colonnes</h3>
              <div className={RESPONSIVE_CLASSES.grid4}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="bg-pink-200 p-4 rounded text-center">
                    Item {i}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test des textes */}
        <Card>
          <CardHeader>
            <CardTitle>Test des Textes Responsives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h1 className={RESPONSIVE_CLASSES.text.h1}>
              Titre H1 Responsive
            </h1>
            <h2 className={RESPONSIVE_CLASSES.text.h2}>
              Titre H2 Responsive
            </h2>
            <h3 className={RESPONSIVE_CLASSES.text.h3}>
              Titre H3 Responsive
            </h3>
            <h4 className={RESPONSIVE_CLASSES.text.h4}>
              Titre H4 Responsive
            </h4>
            <p className={RESPONSIVE_CLASSES.text.body}>
              Ceci est un paragraphe avec du texte responsive qui s'adapte à la taille de l'écran.
            </p>
            <p className={RESPONSIVE_CLASSES.text.small}>
              Texte petit responsive
            </p>
            <p className={RESPONSIVE_CLASSES.text.large}>
              Texte large responsive
            </p>
          </CardContent>
        </Card>

        {/* Test des boutons */}
        <Card>
          <CardHeader>
            <CardTitle>Test des Boutons Responsives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button className={RESPONSIVE_CLASSES.button.small}>
                Petit
              </Button>
              <Button className={RESPONSIVE_CLASSES.button.medium}>
                Moyen
              </Button>
              <Button className={RESPONSIVE_CLASSES.button.large}>
                Grand
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className={RESPONSIVE_CLASSES.button.primary}>
                Primary
              </Button>
              <Button variant="secondary" className={RESPONSIVE_CLASSES.button.secondary}>
                Secondary
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test des cartes */}
        <Card>
          <CardHeader>
            <CardTitle>Test des Cartes Responsives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={RESPONSIVE_CLASSES.cardGrid}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className={RESPONSIVE_CLASSES.card}>
                  <CardHeader>
                    <CardTitle>Carte {i}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Contenu de la carte {i}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test des formulaires */}
        <Card>
          <CardHeader>
            <CardTitle>Test des Formulaires Responsives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={RESPONSIVE_CLASSES.form.container}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom</label>
                  <input 
                    type="text" 
                    className={RESPONSIVE_CLASSES.form.input}
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input 
                    type="email" 
                    className={RESPONSIVE_CLASSES.form.input}
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea 
                    className={RESPONSIVE_CLASSES.form.input}
                    rows={4}
                    placeholder="Votre message"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button className={RESPONSIVE_CLASSES.form.button}>
                  Envoyer
                </Button>
                <Button variant="outline" className={RESPONSIVE_CLASSES.form.button}>
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test des tables */}
        <Card>
          <CardHeader>
            <CardTitle>Test des Tables Responsives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={RESPONSIVE_CLASSES.table.container}>
              <table className={RESPONSIVE_CLASSES.table.table}>
                <thead className={RESPONSIVE_CLASSES.table.header}>
                  <tr>
                    <th className={RESPONSIVE_CLASSES.table.header}>Nom</th>
                    <th className={RESPONSIVE_CLASSES.table.header}>Email</th>
                    <th className={RESPONSIVE_CLASSES.table.header}>Rôle</th>
                    <th className={RESPONSIVE_CLASSES.table.header}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map(i => (
                    <tr key={i}>
                      <td className={RESPONSIVE_CLASSES.table.cell}>Utilisateur {i}</td>
                      <td className={RESPONSIVE_CLASSES.table.cell}>user{i}@example.com</td>
                      <td className={RESPONSIVE_CLASSES.table.cell}>
                        <Badge variant="secondary">Utilisateur</Badge>
                      </td>
                      <td className={RESPONSIVE_CLASSES.table.cell}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions de Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. Redimensionnez votre navigateur pour tester les différents breakpoints</p>
              <p>2. Utilisez les outils de développement (F12) pour simuler différents appareils</p>
              <p>3. Vérifiez que les éléments s'adaptent correctement à chaque taille d'écran</p>
              <p>4. Testez la navigation mobile en réduisant la largeur de l'écran</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResponsiveTest;
