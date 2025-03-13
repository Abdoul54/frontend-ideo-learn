// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

const NavToggle = () => {
  // Hooks
  const { toggleVerticalNav } = useVerticalNav()
  const { isBreakpointReached } = useHorizontalNav()

  // Toggle Vertical Nav
  const handleClick = () => {
    toggleVerticalNav()
  }

  return (
    <>
      {isBreakpointReached && <i className='solar-hamburger-menu-line-duotone text-xl cursor-pointer text-white' style={{
        color: 'var(--mui-palette-customColors-headerIcon)'
      }} onClick={handleClick} />}
    </>
  )
}

export default NavToggle
