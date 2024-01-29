import React, { useEffect, useState } from 'react';

type LazyLoaderProps = {
  isLazyLoadingEnabled: boolean;
  onMount: () => void;
};

const LazyLoader: React.FC<LazyLoaderProps> = React.memo(
  ({ isLazyLoadingEnabled, onMount, children }) => {
    const [shouldRenderChildren, setShouldRenderChildren] = useState(false);

    useEffect(() => {
      onMount();
    }, [onMount]);

    useEffect(() => {
      if (isLazyLoadingEnabled) {
        setTimeout(() => {
          setShouldRenderChildren(true);
        });
      }
    }, [isLazyLoadingEnabled]);

    if (
      !isLazyLoadingEnabled ||
      (isLazyLoadingEnabled && shouldRenderChildren)
    ) {
      return <>{children}</>;
    }
    return null;
  }
);

export default LazyLoader;
