import { supabase } from './supabase'

export const notificationService = {
	async fetchNotifications(userId, options = { limit: 20, offset: 0 }) {
		try {
			const { data, error, count } = await supabase
				.from('notifications')
				.select('*', { count: 'exact' })
				.eq('user_id', userId)
				.order('created_at', { ascending: false })
				.range(options.offset, options.offset + options.limit - 1)

			if (error) throw error

			return {
				notifications: data || [],
				total: count || 0
			}
		} catch (error) {
			console.error('Error fetching notifications:', error)
			throw error
		}
	},

	async getUnreadCount(userId) {
		try {
			if (!userId) {
				console.warn('getUnreadCount called without userId')
				return 0
			}

			const { count, error } = await supabase
				.from('notifications')
				.select('*', { count: 'exact', head: true })
				.eq('user_id', userId)
				.is('read_at', null)

			if (error) {
				console.error('Supabase error in getUnreadCount:', error)
				throw error
			}

			return count || 0
		} catch (error) {
			console.error('Error getting unread count:', error)
			return 0 // Return 0 instead of throwing to avoid breaking the UI
		}
	},

	async markAsRead(notificationId) {
		try {
			const { error } = await supabase
				.rpc('mark_notification_read', {
					p_notification_id: notificationId
				})

			if (error) throw error
			return true
		} catch (error) {
			console.error('Error marking notification as read:', error)
			throw error
		}
	},

	async markAllAsRead(userId) {
		try {
			const { error } = await supabase
				.rpc('mark_all_notifications_read', {
					p_user_id: userId
				})

			if (error) throw error
			return true
		} catch (error) {
			console.error('Error marking all notifications as read:', error)
			throw error
		}
	},

	async archiveNotification(notificationId) {
		try {
			const { error } = await supabase
				.from('notifications')
				.update({ archive: true })
				.eq('id', notificationId)

			if (error) throw error
			return true
		} catch (error) {
			console.error('Error archiving notification:', error)
			throw error
		}
	},

	subscribeToNewNotifications(userId, callback) {
		const channel = supabase
			.channel('new_notification')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'notifications',
					filter: `user_id=eq.${userId}`
				},
				(payload) => {
					callback(payload.new)
				}
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}
}
