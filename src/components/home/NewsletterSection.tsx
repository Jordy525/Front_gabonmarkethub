import { useState } from "react";
import { Mail, Send, CheckCircle, Gift, Bell, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Veuillez saisir votre adresse email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Veuillez saisir une adresse email valide");
      return;
    }

    setIsLoading(true);

    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubscribed(true);
      toast.success("Inscription réussie ! Vous recevrez nos dernières offres par email.");
      setEmail("");
    } catch (error) {
      toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Merci pour votre inscription ! 🎉
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Vous recevrez bientôt nos meilleures offres et actualités business directement dans votre boîte mail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-green-600 hover:bg-gray-100"
                onClick={() => window.location.href = '/products'}
              >
                Découvrir nos produits
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-green-600"
                onClick={() => setIsSubscribed(false)}
              >
                S'inscrire avec un autre email
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-8 h-8" />
                <h2 className="text-3xl font-bold">
                  Restez Informé
                </h2>
              </div>
              
              <p className="text-xl text-white/90 mb-6">
                Recevez en exclusivité nos meilleures offres, nouveautés produits et actualités business du Gabon
              </p>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/90">Offres exclusives et promotions en avant-première</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/90">Alertes sur les nouveaux produits et fournisseurs</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/90">Tendances du marché B2B gabonais</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">5,000+</div>
                  <div className="text-sm text-white/70">Abonnés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">2x/sem</div>
                  <div className="text-sm text-white/70">Newsletters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">95%</div>
                  <div className="text-sm text-white/70">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right Form */}
            <div>
              <Card className="border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Inscription Newsletter
                    </h3>
                    <p className="text-gray-600">
                      Rejoignez notre communauté de professionnels
                    </p>
                  </div>

                  <form onSubmit={handleSubscribe} className="space-y-6">
                    <div>
                      <label htmlFor="newsletter-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse email professionnelle
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="newsletter-email"
                          type="email"
                          placeholder="votre@entreprise.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-12 text-lg"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold h-12 text-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Inscription en cours...
                        </div>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          S'abonner gratuitement
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      En vous inscrivant, vous acceptez de recevoir nos emails marketing. 
                      Vous pouvez vous désabonner à tout moment.
                    </p>
                  </form>

                  {/* Trust Indicators */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Gratuit</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Sans spam</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Désabonnement facile</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;