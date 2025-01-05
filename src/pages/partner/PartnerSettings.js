import React, { useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { TextInput, Button, Avatar, Text, useTheme } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { usePartner } from '../../hooks/usePartner'
import { supabase } from '../../services/supabase'

export const PartnerSettings = () => {
  const theme = useTheme()
  const { profile, updatePartnerProfile } = usePartner()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    companyName: profile?.companyName || '',
    description: profile?.description || '',
    websiteUrl: profile?.websiteUrl || '',
    logoUrl: profile?.logoUrl || ''
  })

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

        // Uploader l'image vers le bucket Supabase
        const { data, error } = await supabase.storage
          .from('partner-logos')
          .upload(`${profile.id}/${Date.now()}.jpg`, file)

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

      await updatePartnerProfile(formData)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Vous devez être partenaire pour accéder à cette page</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Avatar.Image
            size={120}
            source={formData.logoUrl ? { uri: formData.logoUrl } : null}
            style={styles.logo}
          />
          <Button
            mode="outlined"
            onPress={pickImage}
            loading={loading}
            style={styles.uploadButton}
          >
            Changer le logo
          </Button>
        </View>

        {/* Formulaire */}
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

        {error && (
          <Text style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        >
          Enregistrer les modifications
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
  content: {
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    marginBottom: 16,
  },
  uploadButton: {
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 8,
  },
}) 