/*
 ! We do not recommend using your own custom theme built from scratch.
 ! Instead, we recommend using the merged theme (src/components/theme/mergedTheme.ts) and customizing it as per your needs.
 ! If you still want to use your own custom theme, you must be aware about the MUI theme structure along with MUI CSS Variables.
 ! MUI Theme: https://mui.com/material-ui/customization/default-theme/
 ! MUI CSS Variables: https://mui.com/material-ui/experimental-api/css-theme-variables/overview/
 ! Export this file and import it in the `@components/theme/index.tsx` file to use only this theme.
 */
// Type Imports
import { Inter } from 'next/font/google'

import colorSchemes from '@/@core/theme/colorSchemes'
import customShadows from '@/@core/theme/customShadows'
import overrides from '@/@core/theme/overrides'
import spacing from '@/@core/theme/spacing'
import typography from '@/@core/theme/typography'
import shadows from '@/@core/theme/shadows'

// Next Imports

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800', '900'] })

/* Enable following line and the `settings` parameter in the below `userTheme`
   function in order to access `settings` context value in your custom theme object
 */
const userTheme = (settings, mode, direction) => {
  return {
    direction,
    components: overrides(settings.skin),
    colorSchemes: { light: settings.colorScheme },
    ...spacing,
    shape: {
      borderRadius: 10,
      customBorderRadius: {
        xs: 2,
        sm: 4,
        md: 6,
        lg: 8,
        xl: 10
      }
    },
    shadows: shadows(mode),
    typography: typography(inter.style.fontFamily),
    customShadows: customShadows(mode),
    mainColorChannels: {
      light: '38 43 67',
      dark: '234 234 255',
      lightShadow: '38 43 67',
      darkShadow: '16 17 33'
    }
  }
}

export default userTheme