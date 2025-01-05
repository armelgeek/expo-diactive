import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { Text, Tab, TabView } from 'react-native-elements'
import { usePartner } from '../../hooks/usePartner'
import { PartnerStatsCard } from '../../molecules/PartnerStatsCard'
import { OrderCard } from '../../molecules/OrderCard'

export default function PartnerDashboardScreen() {
  const [index, setIndex] = useState(0)
  const { 
    loading, 
    partnerInfo,
    orders,
    stats,
    updateOrderStatus,
    refreshOrders,
  } = usePartner()

  const pendingOrders = orders.filter(order => order.status === 'pending')
  const confirmedOrders = orders.filter(order => order.status === 'confirmed')
  const completedOrders = orders.filter(order => order.status === 'completed')

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshOrders} />
        }
      >
        <Text h4 style={styles.title}>
          {partnerInfo?.company_name}
        </Text>

        <PartnerStatsCard
          totalOrders={stats.totalOrders}
          totalPoints={stats.totalPoints}
          pendingOrders={stats.pendingOrders}
        />

        <Tab
          value={index}
          onChange={setIndex}
          indicatorStyle={styles.indicator}
        >
          <Tab.Item title="En attente" />
          <Tab.Item title="En cours" />
          <Tab.Item title="Terminées" />
        </Tab>

        <TabView value={index} onChange={setIndex} animationType="spring">
          <TabView.Item style={styles.tabContent}>
            <ScrollView>
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                />
              ))}
              {pendingOrders.length === 0 && (
                <Text style={styles.emptyText}>
                  Aucune commande en attente
                </Text>
              )}
            </ScrollView>
          </TabView.Item>

          <TabView.Item style={styles.tabContent}>
            <ScrollView>
              {confirmedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                />
              ))}
              {confirmedOrders.length === 0 && (
                <Text style={styles.emptyText}>
                  Aucune commande en cours
                </Text>
              )}
            </ScrollView>
          </TabView.Item>

          <TabView.Item style={styles.tabContent}>
            <ScrollView>
              {completedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                />
              ))}
              {completedOrders.length === 0 && (
                <Text style={styles.emptyText}>
                  Aucune commande terminée
                </Text>
              )}
            </ScrollView>
          </TabView.Item>
        </TabView>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    padding: 20,
    textAlign: 'center',
  },
  indicator: {
    backgroundColor: '#2089dc',
  },
  tabContent: {
    width: '100%',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
}) 