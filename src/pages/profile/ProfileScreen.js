import React from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Avatar, Button, ListItem, Icon, Badge, Overlay, Input } from 'react-native-elements'
import { useSteps } from '../../hooks/useSteps'
import { usePartner } from '../../hooks/usePartner'
import { supabase } from '../../services/supabase'
import { useEffect, useState } from 'react'
import { CustomOverlay } from '../../molecules/CustomOverlay'
import { AdminGivePointsModal } from '../../molecules/AdminGivePointsModal'
import { useNavigation } from '@react-navigation/native'
import { Button as PaperButton } from 'react-native-paper'
import { CustomText } from '../../molecules/CustomText'
import { PartnerSection } from './components/PartnerSection'

export default function ProfileScreen() {
  const { points, cumulativePoints, loading, refreshData, weeklyStats } = useSteps()
  const { isPartner, checkPartnerStatus } = usePartner()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [rewards, setRewards] = useState([])
  const [donations, setDonations] = useState([])
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [friendEmail, setFriendEmail] = useState('')
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [showAdminGivePoints, setShowAdminGivePoints] = useState(false)
  const [isAdmin, setIsAdmin] = useState(true)
  const navigation = useNavigation();

  const fetchProfile = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return
      setUser(currentUser)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error('Erreur lors de la récupération du profil:', err)
    }
  }

  const fetchRewards = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          order_items!inner (
            quantity,
            points_cost,
            reward:rewards (
              title,
              description,
              image_url
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      // Transformer les données pour l'affichage
      const formattedRewards = data.map(order => ({
        id: order.id,
        created_at: order.created_at,
        ...order.order_items[0]?.reward,
        quantity: order.order_items[0]?.quantity,
        points_cost: order.order_items[0]?.points_cost
      })).filter(reward => reward.title) // Ne garder que les commandes avec des récompenses

      setRewards(formattedRewards)
    } catch (err) {
      console.error('Erreur lors de la récupération des récompenses:', err)
    }
  }

  const fetchDonations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          institute:institutes (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setDonations(data)
    } catch (err) {
      console.error('Erreur lors de la récupération des dons:', err)
    }
  }

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Récupérer les amis (relations acceptées)
      const { data: friendsData, error: friendsError } = await supabase
        .from('friendships')
        .select(`
          friend:profiles!friendships_friend_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted')

      if (friendsError) throw friendsError
      setFriends(friendsData.map(f => f.friend))

      // Récupérer les demandes d'amis en attente
      const { data: requestsData, error: requestsError } = await supabase
        .from('friendships')
        .select(`
          user:profiles!friendships_user_id_fkey (
            id,
            full_name,
            email
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending')

      if (requestsError) throw requestsError
      setFriendRequests(requestsData.map(r => r.user))
    } catch (err) {
      console.error('Erreur lors de la récupération des amis:', err)
    } finally {
      setLoadingFriends(false)
    }
  }

  const handleAddFriend = async () => {
    try {
      if (!friendEmail) return
      setLoadingFriends(true)

      // Trouver l'utilisateur par email
      const { data: friendData, error: friendError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', friendEmail)
        .single()

      if (friendError) throw new Error("Utilisateur non trouvé")

      // Envoyer la demande d'ami
      const { error: requestError } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendData.id,
          status: 'pending'
        })

      if (requestError) throw requestError

      alert("Demande d'ami envoyée !")
      setFriendEmail('')
      setShowAddFriend(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoadingFriends(false)
    }
  }

  const handleFriendRequest = async (friendId, accept) => {
    try {
      setLoadingFriends(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (accept) {
        // Accepter la demande
        const { error } = await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('user_id', friendId)
          .eq('friend_id', user.id)

        if (error) throw error
      } else {
        // Refuser la demande
        const { error } = await supabase
          .from('friendships')
          .delete()
          .eq('user_id', friendId)
          .eq('friend_id', user.id)

        if (error) throw error
      }

      await fetchFriends()
    } catch (err) {
      console.error("Erreur lors du traitement de la demande d'ami:", err)
    } finally {
      setLoadingFriends(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err)
    }
  }

  const refreshAll = async () => {
    await Promise.all([
      fetchProfile(),
      fetchRewards(),
      fetchDonations(),
      fetchFriends(),
      refreshData(),
      checkPartnerStatus(),
    ])
  }

  useEffect(() => {
    refreshAll()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Vérifier si l'utilisateur est un admin (vous pouvez adapter la logique selon vos besoins)
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setIsAdmin(data?.is_admin || false)
    } catch (err) {
      console.error('Erreur lors de la vérification du statut admin:', err)
    }
  }

  useEffect(() => {
    checkAdminStatus()
  }, [])

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={loading || loadingFriends} 
          onRefresh={refreshAll}
        />
      }
    >
      <Card containerStyle={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Avatar
            size="xlarge"
            rounded
            icon={{ name: 'user', type: 'font-awesome' }}
            containerStyle={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text h4>{profile?.full_name || user?.email}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>
      </Card>

      <Card containerStyle={styles.statsCard}>
        <Card.Title>Points et Statistiques</Card.Title>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{cumulativePoints?.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Points Cumulés</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{points?.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Points Disponibles</Text>
          </View>
        </View>
      </Card>

      <Card containerStyle={styles.activityCard}>
        <Card.Title>Activité Récente</Card.Title>
        {weeklyStats.map((stat, index) => (
          <ListItem key={index} bottomDivider>
            <Icon name="directions-walk" type="material" />
            <ListItem.Content>
              <ListItem.Title>{stat.steps_count.toLocaleString()} pas</ListItem.Title>
              <ListItem.Subtitle>{formatDate(stat.date)}</ListItem.Subtitle>
            </ListItem.Content>
            <Text style={styles.pointsEarned}>+{stat.points_earned} pts</Text>
          </ListItem>
        ))}
      </Card>

      <Card containerStyle={styles.rewardsCard}>
        <Card.Title>Récompenses Obtenues</Card.Title>
        {rewards.map((reward, index) => (
          <ListItem key={index} bottomDivider>
            <Icon name="gift" type="font-awesome" />
            <ListItem.Content>
              <ListItem.Title>{reward.title || ''}</ListItem.Title>
              <ListItem.Subtitle>{formatDate(reward.created_at)}</ListItem.Subtitle>
            </ListItem.Content>
            <Text style={styles.pointsCost}>-{reward.points_cost} pts</Text>
          </ListItem>
        ))}
      </Card>

      <Card containerStyle={styles.donationsCard}>
        <Card.Title>Dons Effectués</Card.Title>
        {donations.map((donation, index) => (
          <ListItem key={index} bottomDivider>
            <Icon name="heart" type="font-awesome" />
            <ListItem.Content>
              <ListItem.Title>{donation.institute.name}</ListItem.Title>
              <ListItem.Subtitle>{formatDate(donation.created_at)}</ListItem.Subtitle>
            </ListItem.Content>
            <Text style={styles.pointsCost}>-{donation.points_amount} pts</Text>
          </ListItem>
        ))}
      </Card>

      <Card containerStyle={styles.friendsCard}>
        <View style={styles.cardHeader}>
          <Card.Title>Amis</Card.Title>
          <Button
            type="clear"
            icon={<Icon name="user-plus" type="font-awesome" size={20} />}
            onPress={() => setShowAddFriend(true)}
          />
        </View>
        
        {friendRequests.length > 0 && (
          <View style={styles.requestsSection}>
            <Text style={styles.sectionTitle}>Demandes d'amis</Text>
            {friendRequests.map((request, index) => (
              <ListItem key={`request-${index}`} bottomDivider>
                <Icon name="user" type="font-awesome" />
                <ListItem.Content>
                  <ListItem.Title>{request.full_name || request.email}</ListItem.Title>
                </ListItem.Content>
                <Button
                  type="clear"
                  icon={<Icon name="check" type="font-awesome" color="green" />}
                  onPress={() => handleFriendRequest(request.id, true)}
                />
                <Button
                  type="clear"
                  icon={<Icon name="times" type="font-awesome" color="red" />}
                  onPress={() => handleFriendRequest(request.id, false)}
                />
              </ListItem>
            ))}
          </View>
        )}

        <View style={styles.friendsSection}>
          <Text style={styles.sectionTitle}>Mes amis ({friends.length})</Text>
          {friends.map((friend, index) => (
            <ListItem key={`friend-${index}`} bottomDivider>
              <Icon name="user" type="font-awesome" />
              <ListItem.Content>
                <ListItem.Title>{friend.full_name || friend.email}</ListItem.Title>
                <ListItem.Subtitle>{friend.email}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          ))}
          {friends.length === 0 && (
            <Text style={styles.emptyText}>Aucun ami pour le moment</Text>
          )}
        </View>
      </Card>

      <Card containerStyle={styles.actionsCard}>
        <Card.Title>Actions</Card.Title>
        <Button
          title="Voir mes commandes"
          type="outline"
          icon={<Icon name="list" type="font-awesome" size={15} color="#2089dc" style={{ marginRight: 10 }} />}
          onPress={() => navigation.navigate('Orders')}
          containerStyle={styles.button}
        />
        <Button
          title="Voir mes amis"
          type="outline"
          icon={<Icon name="users" type="font-awesome" size={15} color="#2089dc" style={{ marginRight: 10 }} />}
          onPress={() => navigation.navigate('FriendsActivity')}
          containerStyle={styles.button}
        />
        <Button
          title="Modifier le profil"
          type="outline"
          containerStyle={styles.button}
        />
        <PartnerSection isPartner={isPartner} navigation={navigation} />
        <Button
          title="Se déconnecter"
          onPress={handleSignOut}
          containerStyle={styles.button}
          buttonStyle={styles.signOutButton}
        />
      </Card>

      {isAdmin && (
        <Card containerStyle={styles.adminCard}>
          <Card.Title>Administration</Card.Title>
          <Button
            title="Donner des points"
            type="outline"
            onPress={() => setShowAdminGivePoints(true)}
            containerStyle={styles.button}
            icon={<Icon name="gift" type="font-awesome" size={15} color="#2089dc" style={{ marginRight: 10 }} />}
          />
        </Card>
      )}

      <CustomOverlay
        isVisible={showAddFriend}
        onBackdropPress={() => setShowAddFriend(false)}
      >
        <View style={styles.addFriendForm}>
          <Text h4>Ajouter un ami</Text>
          <Input
            placeholder="Email de votre ami"
            value={friendEmail}
            onChangeText={setFriendEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.overlayButtons}>
            <Button
              title="Annuler"
              type="outline"
              onPress={() => setShowAddFriend(false)}
              containerStyle={styles.overlayButton}
            />
            <Button
              title="Envoyer"
              onPress={handleAddFriend}
              disabled={!friendEmail || loadingFriends}
              loading={loadingFriends}
              containerStyle={styles.overlayButton}
            />
          </View>
        </View>
      </CustomOverlay>

      <AdminGivePointsModal
        isVisible={showAdminGivePoints}
        onClose={() => setShowAdminGivePoints(false)}
        onSuccess={refreshData}
      />
    </ScrollView>
  )
}

const additionalStyles = {
  adminCard: {
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#2089dc',
  },
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    borderRadius: 10,
    marginBottom: 10,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  avatar: {
    backgroundColor: '#2089dc',
  },
  userInfo: {
    marginLeft: 20,
    flex: 1,
  },
  email: {
    color: '#666',
    marginTop: 5,
  },
  statsCard: {
    borderRadius: 10,
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2089dc',
  },
  statLabel: {
    color: '#666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e1e1e1',
    marginVertical: 10,
  },
  activityCard: {
    borderRadius: 10,
    marginBottom: 10,
  },
  rewardsCard: {
    borderRadius: 10,
    marginBottom: 10,
  },
  donationsCard: {
    borderRadius: 10,
    marginBottom: 10,
  },
  actionsCard: {
    borderRadius: 10,
  },
  button: {
    marginVertical: 5,
  },
  signOutButton: {
    backgroundColor: '#ff6b6b',
  },
  pointsEarned: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  pointsCost: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  friendsCard: {
    borderRadius: 10,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: -10,
  },
  requestsSection: {
    marginBottom: 20,
  },
  friendsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
    marginBottom: 10,
  },
  overlay: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
  },
  addFriendForm: {
    alignItems: 'center',
  },
  overlayButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  overlayButton: {
    width: '45%',
  },
  ...additionalStyles,
}) 