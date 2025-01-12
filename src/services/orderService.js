import { supabase } from './supabase'

export const orderService = {
	// Get user orders
	getUserOrders: async (userId) => {
		const { data, error } = await supabase
			.from('commande')
			.select(`
        *,
        product:product_id (
          label,
          price,
          photo
        ),
        partner:partner_id (
          nom,
          logo
        ),
        validator:validator_id (
          user_name,
          first_name,
          last_name
        )
      `)
			.eq('user_id', userId)
			.eq('archive', false)
			.order('created_at', { ascending: false })

		if (error) throw error
		return data
	},

	// Get partner orders
	getPartnerOrders: async (partnerId) => {
		const { data, error } = await supabase
			.from('commande')
			.select(`
        *,
        user:user_id (
          user_name,
          first_name,
          last_name,
          avatar_url
        ),
        product:product_id (
          label,
          price,
          photo
        )
      `)
			.eq('partner_id', partnerId)
			.eq('archive', false)
			.order('created_at', { ascending: false })

		if (error) throw error
		return data
	},

	// Create new order
	createOrder: async (orderData) => {
		const { error } = await supabase
			.from('commande')
			.insert({
				user_id: orderData.userId,
				product_id: orderData.productId,
				partner_id: orderData.partnerId,
				quantity: orderData.quantity,
				total_points: orderData.totalPoints,
				type: 'reward',
				status: 'pending'
			})

		if (error) throw error
	},

	// Validate order
	validateOrder: async (orderId, validatorId) => {
		const { error } = await supabase
			.from('commande')
			.update({
				validator_id: validatorId,
				status: 'completed',
				completed_at: new Date()
			})
			.eq('id', orderId)

		if (error) throw error
	},

	// Cancel order
	cancelOrder: async (orderId) => {
		const { error } = await supabase
			.from('commande')
			.update({
				status: 'cancelled',
				archive: true
			})
			.eq('id', orderId)

		if (error) throw error
	},

	// Get order by ID
	getOrderById: async (orderId) => {
		const { data, error } = await supabase
			.from('commande')
			.select(`
        *,
        user:user_id (
          user_name,
          first_name,
          last_name,
          avatar_url
        ),
        product:product_id (
          label,
          price,
          photo
        ),
        partner:partner_id (
          nom,
          logo
        ),
        validator:validator_id (
          user_name,
          first_name,
          last_name
        )
      `)
			.eq('id', orderId)
			.single()

		if (error) throw error
		return data
	},

	// Get pending orders count for partner
	getPendingOrdersCount: async (partnerId) => {
		const { count, error } = await supabase
			.from('commande')
			.select('*', { count: 'exact', head: true })
			.eq('partner_id', partnerId)
			.eq('status', 'pending')
			.eq('archive', false)

		if (error) throw error
		return count
	},

	// Fetch orders with items and rewards
	fetchOrders: async (userId) => {
		try {
			// Récupérer d'abord les commandes
			const { data: orders, error: ordersError } = await supabase
				.from('commande')
				.select(`
					id,
					created_at,
					type,
					total_price,
					partner:partner_id (
						nom,
						logo
					)
				`)
				.eq('user_id', userId)
				.eq('archive', false)
				.order('created_at', { ascending: false })

			if (ordersError) throw ordersError

			// Pour chaque commande, récupérer ses items
			const ordersWithItems = await Promise.all(orders.map(async (order) => {
				const { data: items, error: itemsError } = await supabase
					.from('command_items')
					.select(`
						id,
						quantite,
						point_cost,
						reward_id,
						product_id
					`)
					.eq('commande_id', order.id)

				if (itemsError) throw itemsError

				// Pour chaque item, récupérer l'article ou la récompense associée
				const itemsWithDetails = await Promise.all(items.map(async (item) => {
					let reward = null
					let product = null

					if (item.reward_id) {
						const { data: rewardData, error: rewardError } = await supabase
							.from('reward')
							.select('label, description, image')
							.eq('id', item.reward_id)
							.single()

						if (rewardError) throw rewardError
						reward = {
							title: rewardData.label,
							description: rewardData.description,
							image_url: rewardData.image
						}
					}

					if (item.product_id) {
						const { data: articleData, error: articleError } = await supabase
							.from('article')
							.select('label, description, photo')
							.eq('id', item.product_id)
							.single()

						if (articleError) throw articleError
						product = {
							title: articleData.label,
							description: articleData.description,
							image_url: articleData.photo
						}
					}

					return {
						id: item.id,

						quantity: item.quantite,
						points_cost: item.point_cost,
						reward,
						product
					}
				}))
				return {
					...order,
					status: order.type,
					total_points: order.total_price,
					partner: order.partner ? {
						...order.partner,
						company_name: order.partner.nom,
						logo_url: order.partner.logo
					} : null,
					command_items: itemsWithDetails
				}
			}))

			return ordersWithItems
		} catch (error) {
			console.error('Error fetching orders:', error)
			throw error
		}
	}
}
