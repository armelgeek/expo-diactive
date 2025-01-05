import React from 'react'
import { View, StyleSheet } from 'react-native'
import { DataTable, Text } from 'react-native-paper'

export const RewardRanking = ({ ranking }) => {
  if (!ranking || ranking.length === 0) {
    return (
      <View style={styles.empty}>
        <Text>Aucune donnée disponible</Text>
      </View>
    )
  }

  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title>Récompense</DataTable.Title>
        <DataTable.Title numeric>Vendus</DataTable.Title>
        <DataTable.Title numeric>Commandes</DataTable.Title>
        <DataTable.Title numeric>Points</DataTable.Title>
      </DataTable.Header>

      {ranking.map((item) => (
        <DataTable.Row key={item.rewardId}>
          <DataTable.Cell>{item.rewardTitle}</DataTable.Cell>
          <DataTable.Cell numeric>{item.totalItemsSold}</DataTable.Cell>
          <DataTable.Cell numeric>{item.totalOrders}</DataTable.Cell>
          <DataTable.Cell numeric>{item.totalPointsSpent}</DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  )
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    padding: 16
  }
}) 