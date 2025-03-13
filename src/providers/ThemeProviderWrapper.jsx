
import ThemeProvider from "@/components/theme"

const ThemeProviderWrapper = ({ children }) => {
    return (
        <ThemeProvider systemMode='light'>
            {children}
        </ThemeProvider>
    )
}

export default ThemeProviderWrapper