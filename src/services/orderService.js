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
		const { data, error } = await supabase
			.from('commande')
			.select(`
        *,
        partner:partner_id (
          nom,
          logo
        ),
        command_items (
          id,
          quantite,
          point_cost,
          reward:reward_id (
            label,
            description,
            image
          ),
          product:product_id (
            label,
            description,
            photo
          )
        )
      `)
			.eq('user_id', userId)
			.eq('archive', false)
			.order('created_at', { ascending: false })

		if (error) throw error
		return data || []
	}
}
