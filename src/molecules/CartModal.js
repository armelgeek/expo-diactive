import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Button, Icon, ListItem } from 'react-native-elements'
import { CustomOverlay } from './CustomOverlay'

export const CartModal = ({
  isVisible,
  onClose,
  cart,
  totalPoints,
  availablePoints,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  loading
}) => {
  const canCheckout = totalPoints <= availablePoints && cart.length > 0

  return (
    <CustomOverlay
      isVisible={isVisible}
      onBackdropPress={onClose}
    >
      <View style={styles.container}>
        <Text h4 style={styles.title}>Panier</Text>

        <View style={styles.pointsInfo}>
          <Text style={styles.pointsText}>
            Points disponibles : {availablePoints?.toLocaleString()}
          </Text>
          <Text style={[
            styles.pointsText,
            totalPoints > availablePoints ? styles.pointsError : {}
          ]}>
            Total : {totalPoints?.toLocaleString()} points
          </Text>
        </View>

        <ScrollView style={styles.itemsList}>
          {cart.map((item, index) => (
            <ListItem key={index} bottomDivider>
              <ListItem.Content>
                <ListItem.Title>{item.title}</ListItem.Title>
                <View style={styles.itemDetails}>
                  <View style={styles.quantityControl}>
                    <Button
                      type="clear"
                      icon={<Icon name="minus" type="font-awesome" size={12} />}
                      onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      containerStyle={styles.quantityButton}
                      disabled={item.quantity <= 1}
                    />
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <Button
                      type="clear"
                      icon={<Icon name="plus" type="font-awesome" size={12} />}
                      onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      containerStyle={styles.quantityButton}
                      disabled={item.quantity >= item.stock}
                    />
                  </View>
                  <View>
                    <Text style={styles.itemPoints}>
                      {(item.points_cost * item.quantity)?.toLocaleString()} points
                    </Text>
                    <Text style={styles.stockInfo}>
                      Stock: {item.stock}
                    </Text>
                  </View>
                </View>
              </ListItem.Content>
              <Button
                type="clear"
                icon={<Icon name="trash" type="font-awesome" color="red" />}
                onPress={() => onRemoveItem(item.id)}
              />
            </ListItem>
          ))}
          {cart.length === 0 && (
            <Text style={styles.emptyText}>
              Votre panier est vide
            </Text>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Fermer"
            type="outline"
            onPress={onClose}
            containerStyle={styles.footerButton}
          />
          <Button
            title="Commander"
            onPress={onCheckout}
            disabled={!canCheckout || loading}
            loading={loading}
            containerStyle={styles.footerButton}
          />
        </View>
      </View>
    </CustomOverlay>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxHeight: '80%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  pointsInfo: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2089dc',
  },
  pointsError: {
    color: 'red',
  },
  itemsList: {
    maxHeight: 600,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    marginHorizontal: 5,
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  itemPoints: {
    color: '#2089dc',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  stockInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    paddingTop: 20,
  },
  footerButton: {
    width: '45%',
  },
}) 