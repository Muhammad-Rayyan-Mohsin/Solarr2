import { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Loader2, 
  Cloud, 
  CloudOff, 
  RefreshCw,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { useOffline } from '@/hooks/use-offline';
import { syncService } from '@/services/syncService';
import { cn } from '@/lib/utils';

export function OfflineStatusIndicator() {
  const { 
    isOnline, 
    isSyncing, 
    pendingSync, 
    lastSyncAttempt, 
    connectionQuality,
    triggerSync 
  } = useOffline();
  
  const [showDetails, setShowDetails] = useState(false);
  const [syncProgress, setSyncProgress] = useState(syncService.getSyncProgress());

  // Update sync progress
  useState(() => {
    const interval = setInterval(() => {
      setSyncProgress(syncService.getSyncProgress());
    }, 1000);

    return () => clearInterval(interval);
  });

  const getConnectionIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    
    switch (connectionQuality) {
      case 'excellent':
        return <SignalHigh className="h-4 w-4 text-green-500" />;
      case 'good':
        return <Signal className="h-4 w-4 text-blue-500" />;
      case 'poor':
        return <SignalLow className="h-4 w-4 text-yellow-500" />;
      default:
        return <Wifi className="h-4 w-4" />;
    }
  };

  const getConnectionColor = () => {
    if (!isOnline) return 'bg-red-100 text-red-800 border-red-200';
    
    switch (connectionQuality) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'poor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSyncStatusText = () => {
    if (isSyncing) {
      if (syncProgress.total > 0) {
        const percentage = Math.round((syncProgress.completed / syncProgress.total) * 100);
        return `Syncing... ${percentage}%`;
      }
      return 'Syncing...';
    }
    
    if (pendingSync > 0) {
      return `${pendingSync} pending`;
    }
    
    return 'Up to date';
  };

  const formatLastSync = () => {
    if (lastSyncAttempt === 0) return 'Never';
    
    const now = Date.now();
    const diff = now - lastSyncAttempt;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Main Status Indicator */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-2 px-3 py-1 h-auto border rounded-full",
                getConnectionColor()
              )}
              onClick={() => setShowDetails(!showDetails)}
            >
              {getConnectionIcon()}
              <span className="text-xs font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
              {isSyncing && <Loader2 className="h-3 w-3 animate-spin" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">
                {isOnline ? 'Connected' : 'No Connection'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isOnline 
                  ? `Connection quality: ${connectionQuality}`
                  : 'Working offline'
                }
              </p>
              {pendingSync > 0 && (
                <p className="text-xs text-muted-foreground">
                  {pendingSync} items pending sync
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Sync Status */}
        {pendingSync > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 px-2 py-1 h-auto"
                onClick={triggerSync}
                disabled={isSyncing || !isOnline}
              >
                <Cloud className="h-3 w-3" />
                <span className="text-xs">{getSyncStatusText()}</span>
                {isSyncing && <Loader2 className="h-3 w-3 animate-spin" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">Sync Status</p>
                <p className="text-xs text-muted-foreground">
                  Last sync: {formatLastSync()}
                </p>
                {isOnline && !isSyncing && (
                  <p className="text-xs text-muted-foreground">
                    Click to sync now
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Manual Sync Button */}
        {isOnline && !isSyncing && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={triggerSync}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Manual sync</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Detailed Status Panel */}
        {showDetails && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg p-4 z-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Connection Status</h4>
                <Badge variant={isOnline ? "default" : "destructive"}>
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>

              {isOnline && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Connection Quality:</span>
                    <Badge variant="outline" className="capitalize">
                      {connectionQuality}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Sync Status:</span>
                  <span className="font-medium">{getSyncStatusText()}</span>
                </div>

                {isSyncing && syncProgress.total > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{syncProgress.completed}/{syncProgress.total}</span>
                    </div>
                    <Progress 
                      value={(syncProgress.completed / syncProgress.total) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {syncProgress.current}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span>Last Sync:</span>
                  <span className="text-muted-foreground">{formatLastSync()}</span>
                </div>

                {pendingSync > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Pending Items:</span>
                    <Badge variant="outline">{pendingSync}</Badge>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={triggerSync}
                  disabled={isSyncing || !isOnline}
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

