const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export async function getWindAnalysis(signal) {
    const response = await fetch(`${API_BASE_URL}/api/analysis`, {
        signal,
    })

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`

        try {
            const errorData = await response.json()
            message = errorData.detail || message
        } catch {
            // Keep the original HTTP error message.
        }

        throw new Error(message)
    }

    const result = await response.json()

    if (!result.metrics || !Array.isArray(result.data)) {
        throw new Error('Unexpected analysis response format.')
    }

    return result
}