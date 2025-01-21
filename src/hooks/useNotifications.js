import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '../services/notificationService'
import { user as userService } from '../services/api/user'

export const useNotifications = () => {
	const [notifications, setNotifications] = useState([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [loading, setLoading] = useState(true)
	const [hasMore, setHasMore] = useState(true)
	const [offset, setOffset] = useState(0)
	const limit = 20

	const fetchNotifications = useCallback(async (reset = false) => {
		try {
			setLoading(true)
			const user = await userService.getUser()
			const newOffset = reset ? 0 : offset

			const { notifications: newNotifications, total } =
				await notificationService.fetchNotifications(user.id, {
					limit,
					offset: newOffset
				})

			if (reset) {
				setNotifications(newNotifications)
			} else {
				setNotifications(prev => [...prev, ...newNotifications])
			}

			setHasMore(newOffset + limit < total)
			setOffset(reset ? limit : newOffset + limit)
		} catch (error) {
			console.error('Error in useNotifications.fetchNotifications:', error)
		} finally {
			setLoading(false)
		}
	}, [offset])

	const fetchUnreadCount = useCallback(async () => {
		try {
			const user = await userService.getUser()
			const count = await notificationService.getUnreadCount(user.id)
			setUnreadCount(count)
		} catch (error) {
			console.error('Error in useNotifications.fetchUnreadCount:', error)
		}
	}, [])

	const markAsRead = useCallback(async (notificationId) => {
		try {
			await notificationService.markAsRead(notificationId)
			setNotifications(prev =>
				prev.map(notif =>
					notif.id === notificationId
						? { ...notif, read_at: new Date().toISOString() }
						: notif
				)
			)
			await fetchUnreadCount()
		} catch (error) {
			console.error('Error in useNotifications.markAsRead:', error)
		}
	}, [fetchUnreadCount])

	const markAllAsRead = useCallback(async () => {
		try {
			const user = await userService.getUser()
			await notificationService.markAllAsRead(user.id)
			setNotifications(prev =>
				prev.map(notif => ({
					...notif,
					read_at: notif.read_at || new Date().toISOString()
				}))
			)
			setUnreadCount(0)
		} catch (error) {
			console.error('Error in useNotifications.markAllAsRead:', error)
		}
	}, [])

	const archiveNotification = useCallback(async (notificationId) => {
		try {
			await notificationService.archiveNotification(notificationId)
			setNotifications(prev =>
				prev.filter(notif => notif.id !== notificationId)
			)
			await fetchUnreadCount()
		} catch (error) {
			console.error('Error in useNotifications.archiveNotification:', error)
		}
	}, [fetchUnreadCount])

	const refresh = useCallback(async () => {
		setOffset(0)
		await Promise.all([
			fetchNotifications(true),
			fetchUnreadCount()
		])
	}, [fetchNotifications, fetchUnreadCount])

	useEffect(() => {
		refresh()

		// Souscrire aux nouvelles notifications
		const unsubscribe = userService.getUser().then(user => {
			return notificationService.subscribeToNewNotifications(
				user.id,
				async () => {
					await refresh()
				}
			)
		})

		return () => {
			unsubscribe.then(unsub => unsub())
		}
	}, [refresh])

	return {
		notifications,
		unreadCount,
		loading,
		hasMore,
		fetchMore: () => fetchNotifications(false),
		refresh,
		markAsRead,
		markAllAsRead,
		archiveNotification
	}
}
