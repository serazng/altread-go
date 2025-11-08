import { useState, useCallback } from 'react'
import { GenerateAltTextRequest, GenerateAltTextResponse } from '../types'
import { API_BASE_URL } from '../utils/api'

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateAltText = useCallback(async (request: GenerateAltTextRequest): Promise<GenerateAltTextResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/alt-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate alt text')
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate alt text'
      setError(errorMessage)
      return {
        success: false,
        altText: '',
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    generateAltText,
    isLoading,
    error,
    clearError
  }
}
