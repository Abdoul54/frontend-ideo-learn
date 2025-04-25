// app/layout.jsx - Convert to server component
import '@/app/globals.css'
import '@assets/iconify-icons/generated-icons.css'
import 'react-perfect-scrollbar/dist/css/styles.css'
import 'swiper/css'

// Server component with client-side language handling
export default function RootLayout({ children }) {
  // Note: This is now a server component 
  return (
    <html lang="en" dir="ltr" id="__next">
      <body className='flex is-full min-bs-full flex-auto flex-col'>{children}</body>
    </html>
  )
}