import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, Button, Portal, Modal, Text } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../../services/supabase'

export const EditPartnerForm = ({ visible, onDismiss, onSubmit, partner }) => {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    companyName: partner.companyName,
    description: partner.description || '',
    websiteUrl: partner.websiteUrl || '',
    logoUrl: partner.logoUrl
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
      await onSubmit(form)
      onDismiss()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <Text variant="titleLarge" style={styles.title}>
          Modifier le profil
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

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.button}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={loading}
            disabled={loading || !form.companyName}
          >
            Enregistrer
          </Button>
        </View>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8
  },
  title: {
    marginBottom: 16,
    textAlign: 'center'
  },
  input: {
    marginBottom: 16
  },
  imageButton: {
    marginBottom: 16
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8
  },
  button: {
    marginLeft: 8
  }
}) 