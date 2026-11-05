/**
 * Colors from the original NES (Nintendo Entertainment System) palette.
 * The console could only show about 54 colors, so every color in the game
 * comes from this list. That limit is a big part of the "NES look".
 */
export const NES = {
  black: '#000000',
  white: '#FCFCFC',
  grayLight: '#BCBCBC',
  gray: '#7C7C7C',

  blueDark: '#0000BC',
  blue: '#0058F8',
  blueMid: '#0078F8',
  sky: '#3CBCFC',
  skyLight: '#A4E4FC',
  periwinkle: '#6888FC',
  purple: '#6844FC',
  lavender: '#D8B8F8',

  greenDark: '#005800',
  greenForest: '#006800',
  green: '#00A800',
  greenSea: '#00A844',
  greenBright: '#58D854',
  lime: '#B8F818',
  limeLight: '#D8F878',
  teal: '#008888',

  brownDark: '#503000',
  brownRed: '#881400',
  red: '#A81000',
  redBright: '#F83800',
  orange: '#E45C10',
  orangeLight: '#FCA044',
  ochre: '#AC7C00',
  gold: '#F8B800',
  yellowLight: '#F8D878',
  sand: '#FCE0A8',
  skin: '#F0D0B0',
  salmon: '#F87858',
  pink: '#F878F8',
  pinkLight: '#F8B8F8',
  rose: '#F85898',

  cyan: '#00E8D8',
  mint: '#B8F8D8',
  seafoam: '#58F898',
  violet: '#9878F8',
  pastelBlue: '#B8B8F8',
  plum: '#940084',
} as const;
