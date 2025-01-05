import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, Button, Card, Text } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../../services/supabase'

export const CreatePartnerForm = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    companyName: '',
    description: '',
    websiteUrl: '',
    logoUrl: null
  })

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    })

    if (!result.canceled) {
      try {
        setLoading(true)
        const file = {
          uri: result.assets[0].uri,
          name: 'logo.jpg',
          type: 'image/jpeg'
        }

        // Convertir l'URI en Blob
        const response = await fetch(file.uri)
        const blob = await response.blob()

        // Uploader l'image
        const fileName = `partner-logos/${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
          .from('public')
          .upload(fileName, blob)

        if (error) throw error

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('public')
          .getPublicUrl(fileName)

        handleChange('logoUrl', publicUrl)
      } catch (error) {
        console.error('Error uploading image:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSubmit = async () => {
    if (!form.companyName) {
      return
    }

    try {
      setLoading(true)
      await onSubmit({
        company_name: form.companyName,
        description: form.description,
        websiteUrl: form.websiteUrl,
        logoUrl: form.logoUrl
      })
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <Card.Title title="Devenir partenaire" />
      <Card.Content>
        <Text variant="bodyMedium" style={styles.description}>
          Créez votre profil partenaire pour commencer à proposer des récompenses
          aux utilisateurs.
        </Text>

        <TextInput
          label="Nom de l'entreprise"
          value={form.companyName}
          onChangeText={(value) => handleChange('companyName', value)}
          style={styles.input}
          disabled={loading}
        />

        <TextInput
          label="Description"
          value={form.description}
          onChangeText={(value) => handleChange('description', value)}
          style={styles.input}
          multiline
          numberOfLines={3}
          disabled={loading}
        />

        <TextInput
          label="Site web"
          value={form.websiteUrl}
          onChangeText={(value) => handleChange('websiteUrl', value)}
          style={styles.input}
          keyboardType="url"
          disabled={loading}
        />

        <Button
          mode="outlined"
          onPress={pickImage}
          style={styles.imageButton}
          disabled={loading}
        >
          {form.logoUrl ? 'Changer le logo' : 'Ajouter un logo'}
        </Button>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
          disabled={loading || !form.companyName}
        >
          Créer le profil
        </Button>
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  description: {
    marginBottom: 16
  },
  input: {
    marginBottom: 16
  },
  imageButton: {
    marginBottom: 16
  },
  submitButton: {
    marginTop: 8
  }
}) 