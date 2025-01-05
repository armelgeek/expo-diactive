import React from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Card, Icon } from 'react-native-elements'
import { useSteps } from '../../hooks/useSteps'
import { useRewards } from '../../hooks/useRewards'
import { useSocial } from '../../hooks/useSocial'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function DashboardScreen({ navigation }) {
  const { loading: loadingSteps, steps, points, dailyGoal, refreshSteps } = useSteps()
  const { loading: loadingRewards, rewards } = useRewards()
  const { loading: loadingSocial, friends, shareHistory } = useSocial()

  const loading = loadingSteps || loadingRewards || loadingSocial

  // Calculer le pourcentage de l'objectif quotidien
  const goalProgress = Math.min((steps / dailyGoal) * 100, 100)

  // Obtenir les dernières activités
  const recentActivities = [
    /**...shareHistory.map(share => ({
      type: 'share',
      date: share.created_at,
      points: share.points_amount,
      friend: share.receiver.username,
    })),
    **/
    // Ajouter d'autres types d'activités ici
  //].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5) 
 ];
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshSteps} />
      }
    >
      {/* En-tête avec les statistiques principales */}
      <Card containerStyle={styles.statsCard}>
        <View style={styles.statsHeader}>
          <View>
            <Text h4>{steps}</Text>
            <Text style={styles.label}>Pas aujourd'hui</Text>
          </View>
          <View>
            <Text h4>{points}</Text>
            <Text style={styles.label}>Points disponibles</Text>
          </View>
        </View>

        {/* Barre de progression */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${goalProgress}%` }]} />
          <Text style={styles.progressText}>
            {goalProgress.toFixed(0)}% de l'objectif quotidien
          </Text>
        </View>
      </Card>

      {/* Récompenses disponibles */}
      <Text h4 style={styles.sectionTitle}>Récompenses disponibles</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {rewards
          .filter(reward => reward.available)
          .slice(0, 5)
          .map(reward => (
            <Card key={reward.id} containerStyle={styles.rewardCard}>
              <Card.Title>{reward.title}</Card.Title>
              <Text style={styles.points}>{reward.points_cost} points</Text>
              <Text style={styles.description} numberOfLines={2}>
                {reward.description}
              </Text>
            </Card>
          ))}
      </ScrollView>

      {/* Activités récentes */}
      <Text h4 style={styles.sectionTitle}>Activités récentes</Text>
      {recentActivities.map((activity, index) => (
        <Card key={index} containerStyle={styles.activityCard}>
          <View style={styles.activityRow}>
            <View style={styles.activityInfo}>
              <Icon
                name={activity.type === 'share' ? 'share' : 'star'}
                type="material"
                color="#2089dc"
              />
              <View style={styles.activityText}>
                <Text>
                  {activity.type === 'share' 
                    ? `Points partagés avec ${activity.friend}`
                    : 'Autre type d\'activité'}
                </Text>
                <Text style={styles.date}>
                  {format(new Date(activity.date), 'dd MMMM yyyy', { locale: fr })}
                </Text>
              </View>
            </View>
            <Text style={styles.points}>{activity.points} points</Text>
          </View>
        </Card>
      ))}

      {/* Amis actifs */}
      <Text h4 style={styles.sectionTitle}>Amis actifs</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {friends.slice(0, 5).map(friend => (
          <Card key={friend.id} containerStyle={styles.friendCard}>
            <View style={styles.friendInfo}>
              <Icon
                name="account-circle"
                type="material"
                size={40}
                color="#2089dc"
              />
              <Text style={styles.friendName}>
                {friend.username}
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsCard: {
    borderRadius: 10,
    marginTop: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  label: {
    color: '#666',
    fontSize: 14,
  },
  progressContainer: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2089dc',
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 20,
    color: '#fff',
    textShadow: '0px 0px 2px rgba(0,0,0,0.5)',
  },
  sectionTitle: {
    padding: 20,
    paddingBottom: 10,
  },
  rewardCard: {
    width: 200,
    borderRadius: 10,
  },
  activityCard: {
    borderRadius: 10,
    padding: 10,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityText: {
    marginLeft: 10,
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  points: {
    color: '#2089dc',
    fontWeight: 'bold',
  },
  description: {
    color: '#666',
    marginTop: 5,
  },
  friendCard: {
    width: 100,
    borderRadius: 10,
    padding: 10,
  },
  friendInfo: {
    alignItems: 'center',
  },
  friendName: {
    marginTop: 5,
    textAlign: 'center',
  },
}) 