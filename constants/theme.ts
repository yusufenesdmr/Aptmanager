import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const theme = {
  colors: {
    primary: '#22304A',
    secondary: '#4A90E2',
    accent: '#2D9CDB',
    background: {
      light: '#FFFFFF',
      dark: '#22304A',
      soft: '#E5E8EC',
    },
    text: {
      light: '#22304A',
      dark: '#FFFFFF',
    },
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
    info: '#2D9CDB',
    gray: {
      100: '#F5F7FA',
      200: '#E5E8EC',
      300: '#D1D5DB',
      400: '#B0B7C3',
      500: '#8896AB',
      600: '#6B7A90',
      700: '#4A5A74',
      800: '#22304A',
      900: '#1A2233',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  dimensions: {
    width,
    height,
  },
}; 