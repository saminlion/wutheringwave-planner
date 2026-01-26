import logger from '@/utils/logger';
import { useGameStore } from '@/store/game';

// Default fallback colors
const DEFAULT_RARITY_COLORS = {
  3: '#3b82f680',
  4: '#6B60B5',
  5: '#C88844',
  6: '#E63946',
};

const DEFAULT_ELEMENT_COLORS = {
  // WW elements
  glacio: '#74D4FF',
  fusion: '#FF5E5E',
  electro: '#C082FF',
  aero: '#53FFC8',
  spectro: '#FFD700',
  havoc: '#FF6AC1',
  // Endfield elements
  physical: '#B0B0B0',  // Silver-gray for physical
  heat: '#FF7043',      // Orange-red for heat
  cryo: '#4FC3F7',      // Light blue for cryo
  electric: '#AB47BC',  // Purple for electric
  nature: '#66BB6A',    // Green for nature
};

/**
 * Get theme colors from current game config
 * Falls back to default colors if not available
 */
const getThemeColors = () => {
  try {
    const gameStore = useGameStore();
    const config = gameStore.currentGameConfig;
    if (config?.themeColors) {
      return {
        rarity: { ...DEFAULT_RARITY_COLORS, ...config.themeColors.rarity },
        element: { ...DEFAULT_ELEMENT_COLORS, ...config.themeColors.element },
      };
    }
  } catch (e) {
    // Store may not be available during initial load
    logger.debug('getThemeColors: gameStore not available, using defaults');
  }
  return {
    rarity: DEFAULT_RARITY_COLORS,
    element: DEFAULT_ELEMENT_COLORS,
  };
};

export const setGradientStyle = (rawData, isBorder = false) => {
  // Null check
  if (!rawData) {
    logger.warn('setGradientStyle: rawData is null');
    return { backgroundColor: '#808080' }; // Default gray
  }

  const { rarity: rarityColors, element: elementColors } = getThemeColors();

  // Debug logging
  logger.debug('setGradientStyle:', {
    element: rawData.element,
    rarity: rawData.rarity,
    elementColor: elementColors[rawData.element],
    rarityColor: rarityColors[rawData.rarity],
  });

  if (!isBorder) {
    if (rawData.element) {
      const elementColor = elementColors[rawData.element] || '#808080';
      return {
        backgroundImage: `linear-gradient(180deg, ${rarityColors[rawData.rarity] || '#808080'} 40%, #FFFFFF 1%, ${elementColor} 59%)`,
      };
    } else {
      return {
        backgroundImage: `linear-gradient(180deg, ${rarityColors[rawData.rarity] || '#808080'} 60%, #FFFFFF 1%)`,
      };
    }
  } else {
    if (rawData.element) {
      const elementColor = elementColors[rawData.element] || '#808080';
      return {
        backgroundImage: `linear-gradient(180deg, ${rarityColors[rawData.rarity] || '#808080'} 40%, ${elementColor} 59%)`,
        border: '5px solid transparent',
        backgroundClip: 'padding-box',
      };
    } else {
      logger.debug('Rendering weapon gradient');
      return {
        backgroundImage: `linear-gradient(180deg, ${rarityColors[rawData.rarity] || '#808080'} 60%, #FFFFFF 1%)`,
        border: '5px solid transparent',
        backgroundClip: 'padding-box',
      };
    }
  }
};
