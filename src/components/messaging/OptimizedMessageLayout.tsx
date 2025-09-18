import React, { useState } from 'react';
import { MessageCircle, Users, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface OptimizedMessageLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  showSidebar?: boolean;
  onToggleSidebar?: () => void;
  conversationCount?: number;
  unreadCount?: number;
  className?: string;
}

export const OptimizedMessageLayout: React.FC<OptimizedMessageLayoutProps> = ({
  children,
  sidebar,
  header,
  showSidebar = true,
  onToggleSidebar,
  conversationCount = 0,
  unreadCount = 0,
  className
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  return (
    <div className={cn("flex h-screen bg-gray-50", className)}>
      {/* Sidebar Desktop - Masqué sur mobile */}
      {showSidebar && (
        <div className={cn(
          "hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
          isCompactMode ? "w-16" : "w-80"
        )}>
          {/* Header Sidebar */}
          <div className="flex-shrink-0 p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              {!isCompactMode && (
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <h2 className="font-semibold text-gray-900">Messages</h2>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCompactMode(!isCompactMode)}
                className="p-1"
              >
                {isCompactMode ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            {sidebar}
          </div>

          {/* Sidebar Footer */}
          {!isCompactMode && (
            <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50">
              <div className="text-xs text-gray-500 text-center">
                {conversationCount} conversation{conversationCount !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Mobile */}
        <div className="lg:hidden flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showSidebar && (
                <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <MessageCircle className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full sm:w-80 p-0">
                    <div className="flex flex-col h-full">
                      <div className="flex-shrink-0 p-4 border-b">
                        <div className="flex items-center justify-between">
                          <h2 className="font-semibold">Messages</h2>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMobileSidebarOpen(false)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        {sidebar}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              <div>
                <h1 className="font-semibold text-gray-900">Messages</h1>
                <p className="text-xs text-gray-500">
                  {conversationCount} conversation{conversationCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {header}
          </div>
        </div>

        {/* Header Desktop */}
        {header && (
          <div className="hidden lg:block flex-shrink-0 bg-white border-b border-gray-200">
            {header}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default OptimizedMessageLayout;