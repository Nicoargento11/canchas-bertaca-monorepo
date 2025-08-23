"use client"

import { useState, useEffect } from 'react'
import { getSession } from './session'

export function useSession() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionData = await getSession()
        setSession(sessionData)
      } catch (error) {
        console.error('Error al cargar la sesión:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [])

  return {
    data: session,
    loading,
    error: null
  }
}
