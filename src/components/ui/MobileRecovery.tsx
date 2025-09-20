import React, { useEffect, useState } from 'react';

/**
 * Composant de récupération d'urgence pour mobile
 * Se déclenche si l'interface devient non-responsive
 */
export const MobileRecovery: React.FC = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    // Seulement sur mobile
    if (window.innerWidth > 640) return;

    let touchStartTime = 0;
    let lastInteraction = Date.now();

    // Détecter si l'interface ne répond plus
    const checkResponsiveness = () => {
      const now = Date.now();
      if (now - lastInteraction > 10000) { // 10 secondes sans interaction
        setIsBlocked(true);
        setShowRecovery(true);
      }
    };

    // Réinitialiser le timer à chaque interaction
    const resetTimer = () => {
      lastInteraction = Date.now();
      setIsBlocked(false);
    };

    // Écouter les interactions
    document.addEventListener('touchstart', resetTimer);
    document.addEventListener('click', resetTimer);
    document.addEventListener('scroll', resetTimer);

    // Vérifier toutes les 5 secondes
    const interval = setInterval(checkResponsiveness, 5000);

    return () => {
      document.removeEventListener('touchstart', resetTimer);
      document.removeEventListener('click', resetTimer);
      document.removeEventListener('scroll', resetTimer);
      clearInterval(interval);
    };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (!showRecovery) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: '20px',
        textAlign: 'center'
      }}
    >
      <div style={{ marginBottom: '20px', fontSize: '48px' }}>⚠️</div>
      <h2 style={{ marginBottom: '10px', fontSize: '18px' }}>Interface bloquée</h2>
      <p style={{ marginBottom: '30px', fontSize: '14px', opacity: 0.8 }}>
        L'application semble ne plus répondre sur mobile.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
        <button
          onClick={handleReload}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '15px 20px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          🔄 Recharger la page
        </button>
        
        <button
          onClick={handleGoHome}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            padding: '15px 20px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          🏠 Retour à l'accueil
        </button>
        
        <button
          onClick={() => setShowRecovery(false)}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '15px 20px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          ❌ Fermer
        </button>
      </div>
    </div>
  );
};

export default MobileRecovery;