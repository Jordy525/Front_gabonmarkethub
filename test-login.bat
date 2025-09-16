@echo off
echo ========================================
echo TEST DE CONNEXION
echo ========================================

echo Test de la connexion avec les bonnes variables...
echo.
echo 1. Création du fichier .env...
echo # Configuration Frontend E-commerce Gabon > .env
echo VITE_API_URL=http://localhost:3001/api >> .env
echo VITE_WS_URL=http://localhost:3001 >> .env
echo VITE_BACKEND_URL=http://localhost:3001 >> .env
echo VITE_SOCKET_URL=http://localhost:3001 >> .env
echo VITE_FRONTEND_URL=http://localhost:8080 >> .env
echo VITE_ADMIN_URL=http://localhost:8080 >> .env
echo VITE_NODE_ENV=development >> .env
echo VITE_DEBUG=true >> .env

echo 2. Redémarrage du serveur de développement...
npm run dev

echo ========================================
echo TEST TERMINÉ
echo ========================================
pause
