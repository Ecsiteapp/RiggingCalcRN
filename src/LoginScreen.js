import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, text } from './theme'

const CREDENTIALS = {
  username: 'ehsmanager@ecsiteapp.com',
  password: 'R!gg1ng@ECS#2025',
}

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = () => {
    setError('')
    setLoading(true)
    setTimeout(() => {
      if (username.trim() === CREDENTIALS.username && password === CREDENTIALS.password) {
        onLogin()
      } else {
        setError('Invalid username or password.')
      }
      setLoading(false)
    }, 400)
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.kav}
      >
        <View style={s.card}>
          {/* Logo */}
          <View style={s.logoBox}>
            <Text style={s.logoIcon}>⚙</Text>
          </View>
          <Text style={s.title}>ECS Rigging Calc</Text>
          <Text style={s.subtitle}>Theatrical Flying Rig — Force & Geometry</Text>

          {/* Email */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>EMAIL</Text>
            <TextInput
              style={s.input}
              value={username}
              onChangeText={setUsername}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          {/* Password */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>PASSWORD</Text>
            <View style={s.pwRow}>
              <TextInput
                style={[s.input, s.pwInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPw}
                autoComplete="password"
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPw(v => !v)}>
                <Text style={s.eyeIcon}>{showPw ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error */}
          {!!error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          {/* Button */}
          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  kav: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 28,
    color: colors.accent,
  },
  title: {
    fontSize: text.h1,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: text.xs,
    color: colors.textMuted,
    marginBottom: 28,
    textAlign: 'center',
  },
  fieldWrap: {
    width: '100%',
    marginBottom: 14,
  },
  label: {
    fontSize: text.xs,
    fontWeight: '600',
    color: colors.textSub,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: text.base,
    color: colors.textPrimary,
    width: '100%',
  },
  pwRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pwInput: {
    flex: 1,
    paddingRight: 44,
  },
  eyeBtn: {
    position: 'absolute',
    right: 10,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#1a0a0a',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    fontSize: text.sm,
    color: colors.danger,
  },
  btn: {
    width: '100%',
    backgroundColor: colors.btnBlue,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#fff',
    fontSize: text.md,
    fontWeight: '600',
  },
})
