import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Card, Text, Avatar, useTheme } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export const PartnerProfileCard = ({ profile }) => {
  const theme = useTheme()

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Avatar.Image
          size={80}
          source={profile.logoUrl ? { uri: profile.logoUrl } : null}
        />
        <View style={styles.info}>
          <Text variant="titleLarge">{profile.companyName}</Text>
          {profile.category && (
            <View style={styles.categoryContainer}>
              <MaterialCommunityIcons 
                name={profile.category.icon_name} 
                size={16} 
                color={theme.colors.primary} 
              />
              <Text variant="bodyMedium" style={styles.categoryText}>
                {profile.category.name}
              </Text>
            </View>
          )}
          <Text variant="bodyMedium" style={styles.description}>
            {profile.description || 'Aucune description'}
          </Text>
          {profile.websiteUrl && (
            <Text 
              variant="bodySmall" 
              style={[styles.website, { color: theme.colors.primary }]}
              onPress={() => Linking.openURL(profile.websiteUrl)}
            >
              {profile.websiteUrl}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  categoryText: {
    marginLeft: 4,
    color: '#666',
  },
  description: {
    marginTop: 4,
    color: '#666',
  },
  website: {
    marginTop: 8,
    textDecorationLine: 'underline',
  },
}) 