import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useDemo = () => {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [demoData, setDemoData] = useState({
    steps: 5000,
    points: 500,
    friends: [
      { id: 'demo1', username: 'Alice', full_name: 'Alice Demo' },
      { id: 'demo2', username: 'Bob', full_name: 'Bob Demo' },
    ],
    shareHistory: [],
    rewards: [
      { 
        id: 'demo1', 
        title: 'Récompense Demo', 
        description: 'Une récompense de test',
        points_cost: 100,
        available: true 
      }
    ]
  })

  useEffect(() => {
    loadDemoState()
  }, [])

  const loadDemoState = async () => {
    try {
      const demoMode = await AsyncStorage.getItem('demoMode')
      setIsDemoMode(demoMode === 'true')
    } catch (error) {
      console.error('Erreur lors du chargement du mode démo:', error)
    }
  }

  const enableDemoMode = async () => {
    try {
      await AsyncStorage.setItem('demoMode', 'true')
      setIsDemoMode(true)
    } catch (error) {
      console.error('Erreur lors de l\'activation du mode démo:', error)
    }
  }

  const disableDemoMode = async () => {
    try {
      await AsyncStorage.setItem('demoMode', 'false')
      setIsDemoMode(false)
    } catch (error) {
      console.error('Erreur lors de la désactivation du mode démo:', error)
    }
  }

  return {
    isDemoMode,
    demoData,
    enableDemoMode,
    disableDemoMode
  }
} 