/**
 * Badge & Certificate Asset Management
 *
 * Maps module names to their badge image paths.
 * When Haseeb delivers final designs, simply replace the files
 * in /public/badges/ and /public/certificates/ — no code changes needed.
 *
 * If filenames differ from the placeholders, only this file needs updating.
 */

export const BADGE_ASSETS: Record<string, { earned: string; locked: string }> = {
  'Incubator Guidelines': {
    earned: '/badges/incubator-guidelines-earned.jpg',
    locked: '/badges/incubator-guidelines-locked.jpg',
  },
  'Marketing Foundations': {
    earned: '/badges/marketing-foundations-earned.jpg',
    locked: '/badges/marketing-foundations-locked.jpg',
  },
  'Know Your Customers': {
    earned: '/badges/know-your-customers-earned.jpg',
    locked: '/badges/know-your-customers-locked.jpg',
  },
  'Go To Market': {
    earned: '/badges/go-to-market-earned.jpg',
    locked: '/badges/go-to-market-locked.jpg',
  },
  'Activate Your Community': {
    earned: '/badges/activate-your-community-earned.jpg',
    locked: '/badges/activate-your-community-locked.jpg',
  },
  'Media & Partnerships': {
    earned: '/badges/media-partnerships-earned.jpg',
    locked: '/badges/media-partnerships-locked.jpg',
  },
};

export const CERTIFICATE_TEMPLATE = '/certificates/certificate-template.svg';

/**
 * Returns the correct badge image path for a given module and state.
 */
export function getBadgeAssetPath(
  moduleName: string,
  earned: boolean
): string {
  const assets = BADGE_ASSETS[moduleName];
  if (!assets) {
    console.warn(`No badge assets found for module: ${moduleName}`);
    return earned ? '/badges/placeholder-earned.jpg' : '/badges/placeholder-locked.jpg';
  }
  return earned ? assets.earned : assets.locked;
}
