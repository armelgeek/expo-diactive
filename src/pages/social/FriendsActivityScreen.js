import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Button, List, Divider, Chip, Portal, Dialog, TextInput } from 'react-native-paper'
import { supabase } from '../../services/supabase'

export default function FriendsActivityScreen() {
  const [loading, setLoading] = useState(false)
  const [activities, setActivities] = useState([])
  const [friendships, setFriendships] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [pointsToShare, setPointsToShare] = useState('')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [error, setError] = useState(null)
  const [pointShares, setPointShares] = useState([])

  const fetchFriendships = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Récupérer toutes les relations d'amitié
      const { data: sentRequests, error: sentError } = await supabase
        .from('friendships')
        .select(`
          id,
          status,
          friend:profiles!friendships_friend_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('user_id', user.id)

      if (sentError) throw sentError

      const { data: receivedRequests, error: receivedError } = await supabase
        .from('friendships')
        .select(`
          id,
          status,
          user:profiles!friendships_user_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('friend_id', user.id)

      if (receivedError) throw receivedError

      // Combiner les demandes envoyées et reçues
      const allFriendships = [
        ...sentRequests.map(req => ({
          id: req.id,
          status: req.status,
          friend: req.friend,
          type: 'sent'
        })),
        ...receivedRequests.map(req => ({
          id: req.id,
          status: req.status,
          friend: req.user,
          type: 'received'
        }))
      ]

      setFriendships(allFriendships)
    } catch (err) {
      console.error('Error fetching friendships:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFriendRequest = async (friendshipId, accept) => {
    try {
      setLoading(true)
      if (accept) {
        // Accepter la demande
        const { error } = await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('id', friendshipId)

        if (error) throw error
      } else {
        // Refuser la demande
        const { error } = await supabase
          .from('friendships')
          .delete()
          .eq('id', friendshipId)

        if (error) throw error
      }

      // Rafraîchir les listes
      await fetchFriendships()
    } catch (err) {
      console.error('Error handling friend request:', err)
    } finally {
      setLoading(false)
    }
  }

 
  const fetchPointShares = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Récupérer le profil de l'utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Récupérer les partages de points reçus
      const { data: receivedShares, error: sharesError } = await supabase
        .from('point_shares')
        .select(`
          id,
          points,
          status,
          created_at,
          sender:profiles!point_shares_sender_id_fkey (
            id,
            full_name,
            email
          ),
          receiver:profiles!point_shares_receiver_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('receiver_id', profile.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (sharesError) throw sharesError
      setPointShares(receivedShares || [])
    } catch (err) {
      console.error('Error fetching point shares:', err)
    }
  }

  const handlePointShareResponse = async (shareId, accept) => {
    try {
      setLoading(true)
      if (accept) {
        // Accepter le partage
        const { error } = await supabase
          .from('point_shares')
          .update({ status: 'accepted' })
          .eq('id', shareId)

        if (error) throw error
      } else {
        // Refuser le partage
        const { error } = await supabase
          .from('point_shares')
          .update({ status: 'rejected' })
          .eq('id', shareId)

        if (error) throw error
      }

      // Rafraîchir les listes
      await fetchPointShares()
    } catch (err) {
      console.error('Error handling point share:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFriendships()
    fetchPointShares()
  }, [])

  const renderActivity = (activity) => {
    const { type, user, details, date, receiver } = activity
    
    switch (type) {
      case 'steps':
        return (
          <List.Item
            title={user.full_name}
            description={`A marché ${details.steps} pas (+${details.points} points)`}
            left={props => <List.Icon {...props} icon="walk" />}
          />
        )
      case 'order':
        return (
          <List.Item
            title={user.full_name}
            description={`A utilisé ${details.points} points pour une commande`}
            left={props => <List.Icon {...props} icon="shopping" />}
          />
        )
      case 'point_share':
        return (
          <List.Item
            title={user.full_name}
            description={`A partagé ${details.points} points avec ${receiver.full_name}`}
            left={props => <List.Icon {...props} icon="gift" />}
          />
        )
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'green'
      case 'pending':
        return 'orange'
      default:
        return 'gray'
    }
  }

  const handleSharePoints = async () => {
    try {
      setLoading(true)
      setError(null)
      const points = parseInt(pointsToShare)
      
      if (isNaN(points) || points <= 0) {
        throw new Error('Le nombre de points doit être positif')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // Récupérer le profil de l'utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profileError) throw profileError

      // Vérifier les points disponibles
      const { data: userPoints, error: pointsError } = await supabase
        .rpc('get_available_points', { p_user_id: user.id })

      if (pointsError) throw pointsError

      if (userPoints < points) {
        throw new Error('Vous n\'avez pas assez de points disponibles')
      }

      // Créer le partage de points
      const { error: shareError } = await supabase
        .from('point_shares')
        .insert({
          sender_id: profile.id,
          receiver_id: selectedFriend.id,
          points: points,
          status: 'pending'
        })

      if (shareError) throw shareError

      setShowShareDialog(false)
      setPointsToShare('')
      setSelectedFriend(null)
      await fetchPointShares()
    } catch (err) {
      console.error('Error sharing points:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderFriendship = (friendship) => {
    const { id, status, friend, type } = friendship
    const isPending = status === 'pending'
    const showActions = isPending && type === 'received'
    const isAccepted = status === 'accepted'

    return (
      <List.Item
        key={id}
        title={friend.full_name || friend.email}
        description={friend.email}
        left={props => <List.Icon {...props} icon="account" />}
        right={props => (
          <View style={styles.rightContent}>
            <Chip
              mode="outlined"
              textStyle={{ color: getStatusColor(status) }}
              style={[styles.statusChip, { borderColor: getStatusColor(status) }]}
            >
              {status === 'accepted' ? 'Ami' : 'En attente'}
            </Chip>
            {showActions && (
              <View style={styles.requestButtons}>
                <Button
                  mode="contained"
                  onPress={() => handleFriendRequest(id, true)}
                  style={styles.acceptButton}
                >
                  Accepter
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleFriendRequest(id, false)}
                  style={styles.rejectButton}
                >
                  Refuser
                </Button>
              </View>
            )}
            {isAccepted && (
              <Button
                mode="contained"
                onPress={() => {
                  setSelectedFriend(friend)
                  setShowShareDialog(true)
                }}
                style={styles.shareButton}
              >
                Partager des points
              </Button>
            )}
          </View>
        )}
      />
    )
  }

  const renderPointShare = (share) => {
    return (
      <List.Item
        key={share.id}
        title={share.sender.full_name || share.sender.email}
        description={`Souhaite vous donner ${share.points} points`}
        left={props => <List.Icon {...props} icon="gift" />}
        right={props => (
          <View style={styles.requestButtons}>
            <Button
              mode="contained"
              onPress={() => handlePointShareResponse(share.id, true)}
              style={styles.acceptButton}
            >
              Accepter
            </Button>
            <Button
              mode="outlined"
              onPress={() => handlePointShareResponse(share.id, false)}
              style={styles.rejectButton}
            >
              Refuser
            </Button>
          </View>
        )}
      />
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={() => {
              fetchFriendships()
              fetchPointShares()
            }} 
          />
        }
      >
        {pointShares.length > 0 && (
          <Card style={styles.pointSharesCard}>
            <Card.Title title="Dons de points reçus" />
            <Card.Content>
              {pointShares.map(renderPointShare)}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.friendsCard}>
          <Card.Title title="Mes amis et demandes" />
          <Card.Content>
            {friendships.map(renderFriendship)}
            {friendships.length === 0 && (
              <Text style={styles.emptyText}>Aucun ami pour le moment</Text>
            )}
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        <Card style={styles.activityCard}>
          <Card.Title title="Activités récentes" />
          <Card.Content>
            {activities.map((activity, index) => (
              <React.Fragment key={index}>
                {renderActivity(activity)}
                {index < activities.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {activities.length === 0 && (
              <Text style={styles.emptyText}>Aucune activité récente</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog
          visible={showShareDialog}
          onDismiss={() => {
            setShowShareDialog(false)
            setError(null)
            setPointsToShare('')
          }}
        >
          <Dialog.Title>Partager des points</Dialog.Title>
          <Dialog.Content>
            <Text>Partager des points avec {selectedFriend?.full_name || selectedFriend?.email}</Text>
            <TextInput
              label="Nombre de points"
              value={pointsToShare}
              onChangeText={setPointsToShare}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowShareDialog(false)
                setError(null)
                setPointsToShare('')
              }}
            >
              Annuler
            </Button>
            <Button
              mode="contained"
              onPress={handleSharePoints}
              loading={loading}
              disabled={loading || !pointsToShare}
            >
              Partager
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pointSharesCard: {
    margin: 16,
  },
  friendsCard: {
    margin: 16,
  },
  activityCard: {
    margin: 16,
  },
  divider: {
    marginVertical: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
  rightContent: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  statusChip: {
    marginBottom: 4,
  },
  requestButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acceptButton: {
    marginRight: 8,
  },
  rejectButton: {
    borderColor: '#ff190c',
  },
  shareButton: {
    marginTop: 8,
  },
  input: {
    marginTop: 16,
  },
  errorText: {
    color: '#ff190c',
    marginTop: 8,
  },
}) 