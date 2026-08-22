'use client';

import Image from 'next/image';
import { getBadgeAssetPath } from '@/lib/assets/badgeAssets';

interface BadgeImageProps {
  moduleName: string;
  earned: boolean;
  size?: number;
  className?: string;
}

/**
 * Renders the actual badge artwork for a module.
 * Two states: earned (full-color) and locked (grayscale/dimmed).
 *
 * Uses CSS grayscale filter for locked state as fallback
 * until Haseeb provides dedicated locked-state assets.
 */
export function BadgeImage({
  moduleName,
  earned,
  size = 80,
  className = '',
}: BadgeImageProps) {
  const assetPath = getBadgeAssetPath(moduleName, earned);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={assetPath}
        alt={`${moduleName} badge${earned ? ' (earned)' : ' (locked)'}`}
        width={size}
        height={size}
        className={`transition-all duration-300 relative z-10 ${
          earned
            ? 'opacity-100 drop-shadow-xl'
            : 'opacity-40 grayscale sepia-[.2] contrast-75'
        }`}
      />
      {earned && (
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-bg-surface rounded-full flex items-center justify-center shadow-lg border border-border-default z-20">
          <div className="w-6 h-6 bg-badge-earned-bg rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-badge-earned-text"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
