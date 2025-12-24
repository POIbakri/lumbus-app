import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: Network.NetworkStateType | null;
  isLoading: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true, // Assume connected initially
    isInternetReachable: true,
    type: null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    // Check initial network state
    async function checkNetwork() {
      try {
        const networkState = await Network.getNetworkStateAsync();
        if (isMounted) {
          setStatus({
            isConnected: networkState.isConnected ?? false,
            isInternetReachable: networkState.isInternetReachable ?? null,
            type: networkState.type ?? null,
            isLoading: false,
          });
        }
      } catch (error) {
        if (isMounted) {
          setStatus(prev => ({ ...prev, isLoading: false }));
        }
      }
    }

    checkNetwork();

    // Poll network status every 5 seconds (expo-network doesn't have listeners)
    const interval = setInterval(checkNetwork, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return status;
}
