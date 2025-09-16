/**
 * Composant de notification pour les erreurs de rate limiting
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface RateLimitNotificationProps {
    isVisible: boolean;
    message?: string;
    retryAfter?: number; // en secondes
    onRetry?: () => void;
    onDismiss?: () => void;
    autoHide?: boolean;
    className?: string;
}

export const RateLimitNotification: React.FC<RateLimitNotificationProps> = ({
    isVisible,
    message = 'Trop de requêtes envoyées. Veuillez patienter.',
    retryAfter = 60,
    onRetry,
    onDismiss,
    autoHide = true,
    className = ''
}) => {
    const [timeLeft, setTimeLeft] = useState(retryAfter);
    const [isCountingDown, setIsCountingDown] = useState(false);

    useEffect(() => {
        if (isVisible && retryAfter > 0) {
            setTimeLeft(retryAfter);
            setIsCountingDown(true);

            const interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsCountingDown(false);
                        if (autoHide && onDismiss) {
                            onDismiss();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isVisible, retryAfter, autoHide, onDismiss]);

    const formatTime = (seconds: number): string => {
        if (seconds < 60) {
            return `${seconds}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const progressPercentage = retryAfter > 0 ? ((retryAfter - timeLeft) / retryAfter) * 100 : 0;

    if (!isVisible) return null;

    return (
        <Alert className={`border-orange-200 bg-orange-50 ${className}`}>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-orange-800 font-medium">
                        {message}
                    </span>
                    {onDismiss && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDismiss}
                            className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
                        >
                            ×
                        </Button>
                    )}
                </div>

                {isCountingDown && timeLeft > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-orange-700">
                            <Clock className="h-3 w-3" />
                            <span>Réessayez dans {formatTime(timeLeft)}</span>
                        </div>

                        <Progress
                            value={progressPercentage}
                            className="h-2 bg-orange-100"
                        />
                    </div>
                )}

                {!isCountingDown && onRetry && (
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRetry}
                            className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Réessayer
                        </Button>
                    </div>
                )}
            </AlertDescription>
        </Alert>
    );
};

/**
 * Hook pour gérer les notifications de rate limiting
 */
export const useRateLimitNotification = () => {
    const [notification, setNotification] = useState<{
        isVisible: boolean;
        message?: string;
        retryAfter?: number;
    }>({
        isVisible: false
    });

    const showRateLimitNotification = (message?: string, retryAfter?: number) => {
        setNotification({
            isVisible: true,
            message,
            retryAfter
        });
    };

    const hideRateLimitNotification = () => {
        setNotification(prev => ({
            ...prev,
            isVisible: false
        }));
    };

    const RateLimitNotificationComponent = ({
        onRetry,
        className
    }: {
        onRetry?: () => void;
        className?: string;
    }) => (
        <RateLimitNotification
            isVisible={notification.isVisible}
            message={notification.message}
            retryAfter={notification.retryAfter}
            onRetry={onRetry}
            onDismiss={hideRateLimitNotification}
            className={className}
        />
    );

    return {
        showRateLimitNotification,
        hideRateLimitNotification,
        RateLimitNotificationComponent,
        isVisible: notification.isVisible
    };
};

export default RateLimitNotification;