import { useMemo } from 'react';
import { NUM_NEARBY_ROUTES_TO_RENDER } from '../constants/carousel';

export const useCarouselRouteIndices = (
  currentRouteIndex: number,
  noOfRoutes: number
) => {
  const minRouteIndex = 0;
  const maxRouteIndex = noOfRoutes - 1;

  const smallestRouteIndexToRender = useMemo(
    () =>
      Math.max(minRouteIndex, currentRouteIndex - NUM_NEARBY_ROUTES_TO_RENDER),
    [currentRouteIndex, minRouteIndex]
  );
  const largestRouteIndexToRender = useMemo(
    () =>
      Math.min(maxRouteIndex, currentRouteIndex + NUM_NEARBY_ROUTES_TO_RENDER),
    [currentRouteIndex, maxRouteIndex]
  );

  return {
    minRouteIndex,
    maxRouteIndex,
    smallestRouteIndexToRender,
    largestRouteIndexToRender,
  };
};
