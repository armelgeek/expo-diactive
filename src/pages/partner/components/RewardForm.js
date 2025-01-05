import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, Button, Portal, Modal, Text } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../../services/supabase'

export const RewardForm = ({ visible, onDismiss, onSubmit, reward = null }) => {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: reward?.title || '',
    description: reward?.description || '',
    pointsCost: reward?.pointsCost?.toString() || '',
    stock: reward?.stock?.toString() || '',
    imageUrl: reward?.imageUrl || null
  })

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8
    })

    if (!result.canceled) {
      try {
        setLoading(true)
        const file = {
          uri: result.assets[0].uri,
          name: 'reward.jpg',
          type: 'image/jpeg'
        }

        // Convertir l'URI en Blob
        const response = await fetch(file.uri)
        const blob = await response.blob()

        // Uploader l'image
        const fileName = `reward-images/${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
          .from('public')
          .upload(fileName, blob)

        if (error) throw error

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('public')
          .getPublicUrl(fileName)

        handleChange('imageUrl', publicUrl)
      } catch (error) {
        console.error('Error uploading image:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const validateForm = () => {
    const errors = []
    if (!form.title) errors.push('Le titre est requis')
    if (!form.description) errors.push('La description est requise')
    if (!form.pointsCost) errors.push('Le coût en points est requis')
    if (isNaN(form.pointsCost) || parseInt(form.pointsCost) <= 0) {
      errors.push('Le coût en points doit être un nombre positif')
    }
    if (!form.stock) errors.push('Le stock est requis')
    if (isNaN(form.stock) || parseInt(form.stock) < 0) {
      errors.push('Le stock doit être un nombre positif ou nul')
    }
    if (!form.imageUrl) errors.push('L\'image est requise')
    return errors
  }

  const handleSubmit = async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      // Afficher les erreurs
      return
    }

    try {
      setLoading(true)
      await onSubmit({
        ...form,
        pointsCost: parseInt(form.pointsCost),
        stock: parseInt(form.stock)
      })
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
          {reward ? 'Modifier la récompense' : 'Nouvelle récompense'}
        </Text>

        <TextInput
          label="Titre"
          value={form.title}
          onChangeText={(value) => handleChange('title', value)}
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

        <View style={styles.row}>
          <TextInput
            label="Coût en points"
            value={form.pointsCost}
            onChangeText={(value) => handleChange('pointsCost', value)}
            style={[styles.input, styles.halfInput]}
            keyboardType="numeric"
            disabled={loading}
          />

          <TextInput
            label="Stock"
            value={form.stock}
            onChangeText={(value) => handleChange('stock', value)}
            style={[styles.input, styles.halfInput]}
            keyboardType="numeric"
            disabled={loading}
          />
        </View>

        <Button
          mode="outlined"
          onPress={pickImage}
          style={styles.imageButton}
          disabled={loading}
        >
          {form.imageUrl ? 'Changer l\'image' : 'Ajouter une image'}
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
            disabled={loading}
          >
            {reward ? 'Enregistrer' : 'Créer'}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  halfInput: {
    width: '48%'
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