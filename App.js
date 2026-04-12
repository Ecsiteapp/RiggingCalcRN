import React, { useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import LoginScreen from './src/LoginScreen'
import CalculatorScreen from './src/CalculatorScreen'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  return (
    <SafeAreaProvider>
      {loggedIn
        ? <CalculatorScreen onLogout={() => setLoggedIn(false)} />
        : <LoginScreen onLogin={() => setLoggedIn(true)} />
      }
    </SafeAreaProvider>
  )
}
