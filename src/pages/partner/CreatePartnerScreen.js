import React, { useState, useEffect } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { useTheme, Text, TextInput, Button } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../services/supabase'
import { usePartner } from '../../hooks/usePartner'

export const CreatePartnerScreen = ({ navigation }) => {
  const theme = useTheme()
  const { createPartnerProfile, isPartner, profile } = usePartner()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    websiteUrl: '',
    logoUrl: '',
    categoryId: null
  })

  useEffect(() => {
    // If user is already a partner, redirect to dashboard
    if (isPartner && profile) {
      navigation.replace('PartnerDashboard')
      return
    }
    fetchCategories()
  }, [isPartner, profile])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_type')
        .select('*')
        .order('label', { ascending: true })

      data.map(item => {
        item.name = item.label
        return item
      })
      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Erreur lors du chargement des catégories')
    }
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled) {
        const file = {
          uri: result.assets[0].uri,
          name: 'logo.jpg',
          type: 'image/jpeg',
        }

        setLoading(true)
        setError(null)

        // Générer un ID temporaire pour le stockage
        const tempId = Date.now() + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

        // Uploader l'image vers le bucket Supabase
        const { data, error } = await supabase.storage
          .from('partner-logos')
          .upload(`temp/${tempId}.jpg`, file)

        if (error) throw error

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('partner-logos')
          .getPublicUrl(data.path)

        setFormData(prev => ({ ...prev, logoUrl: publicUrl }))
      }
    } catch (err) {
      console.error('Error uploading image:', err)
      setError('Erreur lors du téléchargement de l\'image')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      // Valider les champs requis
      if (!formData.companyName.trim()) {
        throw new Error('Le nom de l\'entreprise est requis')
      }

      if (!formData.categoryId) {
        throw new Error('La catégorie est requise')
      }

      // Check if user is already a partner
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data: existingPartner } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingPartner) {
        throw new Error('Vous avez déjà un profil partenaire')
      }

      await createPartnerProfile(formData)
      navigation.replace('PartnerDashboard')
    } catch (err) {
      console.error('Error creating partner profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // If loading initial partner status
  if (loading && !error && !categories.length) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Chargement...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Devenir partenaire
        </Text>

        <TextInput
          label="Nom de l'entreprise"
          value={formData.companyName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, companyName: text }))}
          style={styles.input}
          disabled={loading}
        />

        <TextInput
          label="Description"
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={4}
          style={styles.input}
          disabled={loading}
        />

        <TextInput
          label="Site web"
          value={formData.websiteUrl}
          onChangeText={(text) => setFormData(prev => ({ ...prev, websiteUrl: text }))}
          keyboardType="url"
          style={styles.input}
          disabled={loading}
        />

        <Text variant="bodyMedium" style={styles.label}>Catégorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <Button
              key={category.id}
              mode={formData.categoryId === category.id ? "contained" : "outlined"}
              onPress={() => setFormData(prev => ({ ...prev, categoryId: category.id }))}
              style={styles.categoryButton}
              icon={category.icon_name}
            >
              {category.name}
            </Button>
          ))}
        </ScrollView>

        <Button
          mode="outlined"
          onPress={pickImage}
          style={styles.button}
          disabled={loading}
        >
          {formData.logoUrl ? 'Changer le logo' : 'Ajouter un logo'}
        </Button>

        {error && (
          <Text style={styles.error} variant="bodyMedium">
            {error}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          loading={loading}
        >
          Créer mon profil partenaire
        </Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  label: {
    marginBottom: 8,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    marginRight: 8,
  },
  button: {
    marginVertical: 8,
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
    marginBottom: 16,
  },
})
