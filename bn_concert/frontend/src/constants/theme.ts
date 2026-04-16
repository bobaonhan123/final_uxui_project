export const Colors = {
  primary: '#FF0082',
  primaryDark: '#B3005A',
  secondary: '#2F32A6',
  background: '#F0F0F2',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#282831',
  textSecondary: '#515162',
  textLight: '#A3A3AF',
  textMuted: '#65657A',
  border: '#C1C1CA',
  borderLight: '#E0E0E4',
  borderMedium: '#848495',
  neutral700: '#3D3D49',
  neutral950: '#0A0A0C',
  darkSurface: '#282831',
  darkText: '#1E1E25',
  info: '#4588E7',
  success: '#00BA88',
  error: '#ED2E2E',
  warning: '#F59E0B',
  white: '#FFFFFF',
  black: '#000000',
  neutralSecondary: '#515162',
  overlay: 'rgba(0,0,0,0.5)',
  seatAvailable: '#00BA88',
  seatSelected: '#FF0082',
  seatSold: '#C1C1CA',
  seatHeld: '#F59E0B',
  selectedSurface: '#FFF4F9',
  overlayLight: 'rgba(0,0,0,0.2)',
  overlayStrong: 'rgba(0,0,0,0.8)',
  loadingOverlay: 'rgba(0,0,0,0.6)',
};

export const Overlays = {
  banner: 'rgba(217,217,217,0.8)',
  cardSoft: 'rgba(255,255,255,0.85)',
  category: 'rgba(61,61,73,0.5)',
  modal: 'rgba(0,0,0,0.6)',
};

export const Fonts = {
  regular: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 18, color: Colors.text },
  medium: { fontFamily: 'Inter_500Medium', fontSize: 16, lineHeight: 24, color: Colors.text },
  bold: { fontFamily: 'Inter_700Bold', fontSize: 16, lineHeight: 24, color: Colors.text },
  h1: { fontFamily: 'Inter_700Bold', fontSize: 28, lineHeight: 32, color: Colors.text },
  h2: { fontFamily: 'Inter_700Bold', fontSize: 22, lineHeight: 28, color: Colors.text },
  h3: { fontFamily: 'Inter_600SemiBold', fontSize: 18, lineHeight: 24, color: Colors.text },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16, color: Colors.textSecondary },
  body10: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 10, color: Colors.textLight },
  body12: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 12, color: Colors.text },
  body14: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 18, color: Colors.text },
  body16: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 16, color: Colors.text },
  heading16: { fontFamily: 'Inter_500Medium', fontSize: 16, lineHeight: 32, color: Colors.text },
  heading18: { fontFamily: 'Inter_500Medium', fontSize: 18, lineHeight: 24, color: Colors.text },
  heading20: { fontFamily: 'Inter_600SemiBold', fontSize: 20, lineHeight: 32, color: Colors.text },
  button12: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 12, color: Colors.white },
  button14: { fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 14, color: Colors.white },
  button16: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 16, color: Colors.textSecondary },
  logo: {
    fontFamily: 'DrSugiyama_400Regular',
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: 0.8,
    color: Colors.primary,
  },
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Opacity = {
  low: 0.2,
  medium: 0.5,
  high: 0.8,
};

export const Shadows = {
  sm: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const ComponentSizes = {
  buttonHeightSm: 32,
  buttonHeightMd: 40,
  buttonHeightLg: 48,
  inputHeight: 40,
  textareaMinHeight: 96,
  headerHeight: 40,
  statusBarHeight: 44,
  footerHeight: 902,
  modalWidth: 328,
  seatSize: 32,
};
