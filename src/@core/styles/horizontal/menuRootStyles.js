const menuRootStyles = theme => {
  return {
    '& > ul > li:not(:last-of-type)': {
      marginInlineEnd: theme.spacing(1)
    }
  }
}

export default menuRootStyles
