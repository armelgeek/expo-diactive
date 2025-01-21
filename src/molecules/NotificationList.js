import React from 'react'
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { List, Text, IconButton, Badge, useTheme, Button } from 'react-native-paper'
import { useNotifications } from '../hooks/useNotifications'
import { useTranslation } from 'react-i18next'

const NotificationItem = ({ notification, onMarkAsRead, onArchive }) => {
	const theme = useTheme()
	const isUnread = !notification.read_at

	const getIconProps = () => {
		switch (notification.type) {
			case 'success':
				return { name: 'check-circle', color: theme.colors.success }
			case 'warning':
				return { name: 'alert', color: theme.colors.warning }
			case 'error':
				return { name: 'alert-circle', color: theme.colors.error }
			default:
				return { name: 'information', color: theme.colors.primary }
		}
	}

	return (
		<List.Item
			title={notification.title}
			description={notification.message}
			left={props => (
				<View style={styles.iconContainer}>
					<List.Icon {...props} icon={getIconProps().name} color={getIconProps().color} />
					{isUnread && <Badge size={8} style={styles.unreadBadge} />}
				</View>
			)}
			right={props => (
				<View style={styles.actionsContainer}>
					{isUnread && (
						<IconButton
							icon="check"
							size={20}
							onPress={() => onMarkAsRead(notification.id)}
						/>
					)}
					<IconButton
						icon="delete"
						size={20}
						onPress={() => onArchive(notification.id)}
					/>
				</View>
			)}
			style={[
				styles.notificationItem,
				isUnread && styles.unreadItem
			]}
		/>
	)
}

export const NotificationList = () => {
	const { t } = useTranslation()
	const {
		notifications,
		unreadCount,
		loading,
		hasMore,
		refresh,
		fetchMore,
		markAsRead,
		markAllAsRead,
		archiveNotification
	} = useNotifications()

	const renderHeader = () => (
		<View style={styles.header}>
			<Text variant="titleMedium">
				{t('notifications.title')} {unreadCount > 0 && `(${unreadCount})`}
			</Text>
			{unreadCount > 0 && (
				<Button
					mode="text"
					onPress={markAllAsRead}
					style={styles.markAllButton}
				>
					{t('notifications.markAllRead')}
				</Button>
			)}
		</View>
	)

	const renderEmpty = () => (
		<View style={styles.emptyContainer}>
			<Text variant="bodyLarge" style={styles.emptyText}>
				{t('notifications.empty')}
			</Text>
		</View>
	)

	return (
		<View style={styles.container}>
			{renderHeader()}
			<FlatList
				data={notifications}
				renderItem={({ item }) => (
					<NotificationItem
						notification={item}
						onMarkAsRead={markAsRead}
						onArchive={archiveNotification}
					/>
				)}
				keyExtractor={item => item.id}
				refreshControl={
					<RefreshControl refreshing={loading} onRefresh={refresh} />
				}
				onEndReached={hasMore ? fetchMore : null}
				onEndReachedThreshold={0.5}
				ListEmptyComponent={renderEmpty}
				contentContainerStyle={styles.listContent}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	markAllButton: {
		marginLeft: 8,
	},
	notificationItem: {
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	unreadItem: {
		backgroundColor: '#f5f5f5',
	},
	iconContainer: {
		position: 'relative',
	},
	unreadBadge: {
		position: 'absolute',
		top: 0,
		right: 0,
		backgroundColor: '#2196F3',
	},
	actionsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	emptyText: {
		color: '#666',
		textAlign: 'center',
	},
	listContent: {
		flexGrow: 1,
	},
})
