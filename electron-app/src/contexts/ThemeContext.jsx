import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Récupérer le thème depuis localStorage ou par défaut 'light'
    return localStorage.getItem('app-theme') || 'light'
  })

  useEffect(() => {
    // Sauvegarder le thème dans localStorage
    localStorage.setItem('app-theme', theme)
    // Appliquer le thème au document
    document.documentElement.setAttribute('data-theme', theme)

    const bodyBackground = theme === 'dark' ? '#1a202c' : '#f5f6fa'
    const bodyText = theme === 'dark' ? '#e2e8f0' : '#2c3e50'
    document.body.style.backgroundColor = bodyBackground
    document.body.style.color = bodyText
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
