import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Card, Text, Rating, Image } from 'react-native-elements'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export const PartnerCard = ({
  businessName,
  description,
  logoUrl,
  averageRating,
  categoryName,
  categoryIcon,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card containerStyle={styles.container}>
        <View style={styles.header}>
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderLogo} />
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.businessName}>{businessName}</Text>
            {categoryName && categoryIcon && (
              <View style={styles.category}>
                <MaterialCommunityIcons 
                  name={categoryIcon} 
                  size={16} 
                  color="#666" 
                />
                <Text style={styles.categoryName}>{categoryName}</Text>
              </View>
            )}
            <Rating
              readonly
              startingValue={averageRating || 0}
              imageSize={16}
              style={styles.rating}
            />
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 15,
    margin: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholderLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  category: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryName: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  rating: {
    alignItems: 'flex-start',
  },
  description: {
    color: '#666',
    fontSize: 14,
  },
}) 