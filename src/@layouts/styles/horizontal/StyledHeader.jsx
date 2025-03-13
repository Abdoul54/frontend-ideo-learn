// Third-party Imports
import styled from '@emotion/styled'

// Config Imports
import settingConfig from '@/configs/settingConfig'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const StyledHeader = styled.header`
  box-shadow: none; //var(--mui-customShadows-xs);

  [data-skin='bordered'] & {
    box-shadow: none;
    border-block-end: 1px solid var(--border-color);
  }

  &:not(.${horizontalLayoutClasses.headerBlur}) {
    background-color: var(--mui-palette-customColors-headerBg);
  }

  &.${horizontalLayoutClasses.headerBlur} {
    backdrop-filter: blur(6px);
    background-color: rgb(var(--background-color-rgb) / 0.88);
  }

  &.${horizontalLayoutClasses.headerFixed} {
    position: sticky;
    inset-block-start: 0;
    z-index: var(--header-z-index);
  }

  &.${horizontalLayoutClasses.headerContentCompact} .${horizontalLayoutClasses.navbar} {
    margin-inline: auto;
    max-inline-size: ${settingConfig.compactContentWidth}px;
  }

  .${horizontalLayoutClasses.navbar} {
    position: relative;
    min-block-size: var(--header-height);
    padding-block: 8px;
    padding-inline: ${settingConfig.layoutPadding}px;
  }

  ${({ overrideStyles }) => overrideStyles}
`

export default StyledHeader