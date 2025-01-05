import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Card, Button, Text, Avatar } from 'react-native-elements'

export const FriendCard = ({ 
  username, 
  fullName,
  email,
  onAccept,
  onReject,
  onShare,
  isPending = false,
}) => {
  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : username?.slice(0, 2).toUpperCase()

  return (
    <Card containerStyle={styles.container}>
      <View style={styles.header}>
        <Avatar
          rounded
          title={initials}
          containerStyle={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{fullName || username}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {isPending ? (
          <>
            <Button
              title="Accepter"
              onPress={onAccept}
              buttonStyle={styles.acceptButton}
            />
            <Button
              title="Refuser"
              onPress={onReject}
              type="outline"
              buttonStyle={styles.rejectButton}
            />
          </>
        ) : (
          <Button
            title="Partager des points"
            onPress={onShare}
            type="outline"
          />
        )}
      </View>
    </Card>
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
    marginBottom: 15,
  },
  avatar: {
    backgroundColor: '#2089dc',
  },
  info: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    color: '#666',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  acceptButton: {
    minWidth: 100,
  },
  rejectButton: {
    minWidth: 100,
  },
}) 