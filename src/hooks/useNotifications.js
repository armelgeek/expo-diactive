import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '../services/notificationService'
import { user as userService } from '../services/api/user'

export const useNotifications = () => {
	const [notifications, setNotifications] = useState([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [loading, setLoading] = useState(true)
	const [hasMore, setHasMore] = useState(true)
	const [offset, setOffset] = useState(0)
	const [user, setUser] = useState(null)
	const limit = 20

	// Fetch user once when the hook is initialized
	useEffect(() => {
		const initUser = async () => {
			try {
				const userData = await userService.getUser()
				setUser(userData)
			} catch (error) {
				console.error('Error fetching user:', error)
			}
		}
		initUser()
	}, [])

	const fetchNotifications = useCallback(async (reset = false) => {
		if (!user) return

		try {
			setLoading(true)
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
	}, [offset, user])

	const fetchUnreadCount = useCallback(async () => {
		if (!user) return

		try {
			const count = await notificationService.getUnreadCount(user.id)
			setUnreadCount(count)
		} catch (error) {
			console.error('Error in useNotifications.fetchUnreadCount:', error)
			setUnreadCount(0)
		}
	}, [user])

	const markAsRead = useCallback(async (notificationId) => {
		if (!user) return

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
	}, [fetchUnreadCount, user])

	const markAllAsRead = useCallback(async () => {
		if (!user) return

		try {
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
	}, [user])

	const archiveNotification = useCallback(async (notificationId) => {
		if (!user) return

		try {
			await notificationService.archiveNotification(notificationId)
			setNotifications(prev =>
				prev.filter(notif => notif.id !== notificationId)
			)
			await fetchUnreadCount()
		} catch (error) {
			console.error('Error in useNotifications.archiveNotification:', error)
		}
	}, [fetchUnreadCount, user])

	const refresh = useCallback(async () => {
		if (!user) return

		setOffset(0)
		await Promise.all([
			fetchNotifications(true),
			fetchUnreadCount()
		])
	}, [fetchNotifications, fetchUnreadCount, user])

	// Effect to initialize notifications when user is loaded
	useEffect(() => {
		if (user) {
			refresh()
		}
	}, [refresh, user])

	// Effect to subscribe to new notifications when user is loaded
	useEffect(() => {
		if (!user) return

		const unsubscribe = notificationService.subscribeToNewNotifications(
			user.id,
			async () => {
				await refresh()
			}
		)

		return () => {
			if (typeof unsubscribe === 'function') {
				unsubscribe()
			}
		}
	}, [refresh, user])

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
