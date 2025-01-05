import { Pedometer } from 'expo-sensors'
import { getDistance } from 'geolib'

export const StepsValidator = {
  // Vérifier si le nombre de pas est cohérent avec la distance parcourue
  validateSteps: async (steps, timeframe = 'day') => {
    try {
      // 1. Vérifier la disponibilité du podomètre
      const isAvailable = await Pedometer.isAvailableAsync()
      if (!isAvailable) {
        throw new Error('Podomètre non disponible')
      }

      // 2. Obtenir les données de localisation pour valider la distance
      const { locations } = await Location.getLocationHistoryAsync({
        timeframe: timeframe === 'day' ? 24 * 60 * 60 * 1000 : timeframe
      })

      // 3. Calculer la distance totale parcourue
      let totalDistance = 0
      for (let i = 1; i < locations.length; i++) {
        totalDistance += getDistance(
          { 
            latitude: locations[i-1].coords.latitude, 
            longitude: locations[i-1].coords.longitude 
          },
          { 
            latitude: locations[i].coords.latitude, 
            longitude: locations[i].coords.longitude 
          }
        )
      }

      // 4. Valider la cohérence (en moyenne, un pas = 0.7m)
      const estimatedSteps = Math.round(totalDistance / 0.7)
      const difference = Math.abs(steps - estimatedSteps)
      const isValid = difference <= steps * 0.2 // 20% de marge d'erreur

      return {
        isValid,
        estimatedSteps,
        actualSteps: steps,
        difference,
        distance: totalDistance
      }
    } catch (error) {
      console.error('Erreur lors de la validation des pas:', error)
      return {
        isValid: false,
        error: error.message
      }
    }
  },

  // Vérifier la vitesse moyenne
  validateSpeed: (steps, timeframe) => {
    const stepsPerSecond = steps / timeframe
    const maxNormalSpeed = 3 // 3 pas par seconde max en marche normale
    return stepsPerSecond <= maxNormalSpeed
  }
} 