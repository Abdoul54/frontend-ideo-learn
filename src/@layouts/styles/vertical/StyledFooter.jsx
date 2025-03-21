// Third-party Imports
import styled from '@emotion/styled'

// Config Imports
import settingConfig from '@/configs/settingConfig'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const StyledFooter = styled.footer`
  &.${verticalLayoutClasses.footerContentCompact} {
    &.${verticalLayoutClasses.footerDetached} {
      margin-inline: auto;
      max-inline-size: ${settingConfig.compactContentWidth}px;
    }

    &.${verticalLayoutClasses.footerAttached} .${verticalLayoutClasses.footerContentWrapper} {
      margin-inline: auto;
      max-inline-size: ${settingConfig.compactContentWidth}px;
    }
  }

  &.${verticalLayoutClasses.footerFixed} {
    position: sticky;
    inset-block-end: 0;
    z-index: var(--footer-z-index);

    &.${verticalLayoutClasses.footerAttached},
      &.${verticalLayoutClasses.footerDetached}
      .${verticalLayoutClasses.footerContentWrapper} {
      background-color: var(--mui-palette-background-paper);
    }

    &.${verticalLayoutClasses.footerDetached} {
      pointer-events: none;
      padding-inline: ${settingConfig.layoutPadding}px;

      & .${verticalLayoutClasses.footerContentWrapper} {
        pointer-events: auto;
        ${({ theme }) => `
          box-shadow: 0 -4px 8px -4px rgb(var(--mui-mainColorChannels-${theme.palette.mode}Shadow) / 0.42);
        `}
        border-start-start-radius: var(--border-radius);
        border-start-end-radius: var(--border-radius);

        [data-skin='bordered'] & {
          box-shadow: none;
          border-inline: 1px solid var(--border-color);
          border-block-start: 1px solid var(--border-color);
        }
      }
    }

    &.${verticalLayoutClasses.footerAttached} {
      ${({ theme }) => `
          box-shadow: 0 -4px 8px -4px rgb(var(--mui-mainColorChannels-${theme.palette.mode}Shadow) / 0.42);
      `}

      [data-skin='bordered'] & {
        box-shadow: none;
        border-block-start: 1px solid var(--border-color);
      }
    }
  }

  & .${verticalLayoutClasses.footerContentWrapper} {
    padding-block: 16px;
    padding-inline: ${settingConfig.layoutPadding}px;
  }

  ${({ overrideStyles }) => overrideStyles}
`

export default StyledFooter
