import { supabase } from './supabase'

export const partnerService = {
	// Get all partners
	getAllPartners: async () => {
		const { data, error } = await supabase
			.from('partner')
			.select(`
				*,
				type:type_id (
				label
				)
			`)
			.eq('archive', false)
			.order('nom')

		if (error) throw error
		return data
	},

	// Get partner categories
	getPartnerCategories: async () => {
		const { data, error } = await supabase
			.from('partner_type')
			.select('*')
			.order('label')

		if (error) throw error
		return data
	},

	// Get partners by categories
	getPartnersGroupedByCategories: async () => {
		const { data: partnersData, error: partnersError } = await supabase
			.from('partner')
			.select(`
				id,
				nom,
				description,
				logo,
				type_id
			`)
			.order('nom')
		partnersData.forEach(partner => {
			Object.assign(partner, {
				company_name: partner.nom,
				logo_url: partner.logo,
				category_id: partner.type_id,
			}, { nom: undefined, logo: undefined, type_id: undefined });
		})

		if (partnersError) throw partnersError

		// Group partners by category using mapping
		const groupedPartners = partnersData.reduce((acc, partner) => {
			const categoryId = partner.category_id
			if (!acc[categoryId]) {
				acc[categoryId] = []
			}
			acc[categoryId].push(partner)
			return acc
		}, {})

		return groupedPartners
	},

	// Get partner by ID
	getPartnerById: async (partnerId) => {
		const { data, error } = await supabase
			.from('partner')
			.select(`
        *,
        type:type_id (
          label
        ),
        products:product (
          id,
          label,
          description,
          price,
          photo,
          quantity,
		  points_cost,
          archive
        )
      `)
			.eq('id', partnerId)
			.eq('archive', false)
			.single()

		if (error) throw error
		return data
	},

	// Get partner types
	getPartnerTypes: async () => {
		const { data, error } = await supabase
			.from('partner_type')
			.select('*')
			.eq('archive', false)
			.order('label')

		if (error) throw error
		return data
	},

	// Create partner
	createPartner: async (partnerData) => {
		const { data, error } = await supabase
			.from('partner')
			.insert({
				nom: partnerData.nom,
				description: partnerData.description,
				address: partnerData.address,
				type_id: partnerData.typeId,
				logo: partnerData.logo,
				website_url: partnerData.websiteUrl
			})
			.select()
			.single()

		if (error) throw error
		return data
	},

	// Update partner
	updatePartner: async (partnerId, partnerData) => {
		const { error } = await supabase
			.from('partner')
			.update({
				nom: partnerData.nom,
				description: partnerData.description,
				address: partnerData.address,
				type_id: partnerData.typeId,
				logo: partnerData.logo,
				website_url: partnerData.websiteUrl,
				updated_at: new Date()
			})
			.eq('id', partnerId)

		if (error) throw error
	},

	// Delete partner (soft delete)
	deletePartner: async (partnerId) => {
		const { error } = await supabase
			.from('partner')
			.update({
				archive: true,
				updated_at: new Date()
			})
			.eq('id', partnerId)

		if (error) throw error
	},

	// Get partner profile
	getPartnerProfile: async (userId) => {
		const { data, error } = await supabase
			.from('profile_partner')
			.select(`
        *,
        partner:partner_id (
          *,
          type:type_id (
            label
          )
        )
      `)
			.eq('user_id', userId)
			.eq('archive', false)
			.single()

		if (error) throw error
		return data
	},

	// Create partner profile
	createPartnerProfile: async (userId, partnerProfileData) => {
		const { data, error } = await supabase
			.from('profile_partner')
			.insert({
				user_id: userId,
				partner_id: partnerProfileData.partnerId,
				user_name: partnerProfileData.userName,
				first_name: partnerProfileData.firstName,
				last_name: partnerProfileData.lastName,
				activated: false
			})
			.select()
			.single()

		if (error) throw error
		return data
	},

	// Update partner profile
	updatePartnerProfile: async (userId, partnerProfileData) => {
		const { error } = await supabase
			.from('profile_partner')
			.update({
				user_name: partnerProfileData.userName,
				first_name: partnerProfileData.firstName,
				last_name: partnerProfileData.lastName,
				updated_at: new Date()
			})
			.eq('user_id', userId)

		if (error) throw error
	},

	// Check if user is partner
	checkPartnerStatus: async (userId) => {
		const { data, error } = await supabase
			.from('profile_partner')
			.select('activated')
			.eq('user_id', userId)
			.eq('archive', false)
			.single()

		if (error && error.code !== 'PGRST116') throw error
		return data?.activated || false
	},

	// Get partner products
	getPartnerProducts: async (partnerId) => {
		const { data, error } = await supabase
			.from('article')
			.select('*')
			.eq('partner_id', partnerId)
			.eq('archive', false)
			.order('created_at', { ascending: false })

		if (error) throw error

		// Map the data to match the expected format
		return data.map(article => ({
			...article,
			title: article.label,
			description: article.description,
			image_url: article.photo,
			points_price: article.points_cost,
			available: article.quantity > 0
		}))
	},

	// Get partner rewards
	getPartnerRewards: async (partnerId) => {
		const { data, error } = await supabase
			.from('reward')
			.select('*')
			.eq('partner_id', partnerId)
			.eq('archive', false)
			.order('created_at', { ascending: false })

		if (error) throw error
		return data
	},

	// Upload partner logo
	uploadPartnerLogo: async (file) => {
		try {
			// Convert URI to Blob
			const response = await fetch(file.uri)
			const blob = await response.blob()

			// Upload the image
			const fileName = `partner-logos/${Date.now()}-${file.name}`
			const { data, error } = await supabase.storage
				.from('public')
				.upload(fileName, blob)

			if (error) throw error

			// Get public URL
			const { data: { publicUrl } } = supabase.storage
				.from('public')
				.getPublicUrl(fileName)

			return publicUrl
		} catch (error) {
			console.error('Error uploading logo:', error)
			throw error
		}
	},

	// Get partner orders
	getPartnerOrders: async (partnerId) => {
		try {
			const { data, error } = await supabase
				.from('commande')
				.select(`
					id,
					created_at,
					status,
					total_points,
					partner:partner_id (
						nom,
						description
					),
					commande_items (
						id,
						quantity,
						points_cost,
						reward:reward_id (
							title,
							description,
							image_url
						),
						article:article_id (
							label,
							description,
							photo
						)
					)
				`)
				.eq('partner_id', partnerId)
				.order('created_at', { ascending: false })

			if (error) throw error

			// Map the data to match the expected format
			return data.map(order => ({
				...order,
				partner: {
					...order.partner,
					company_name: order.partner.nom
				},
				order_items: order.commande_items.map(item => ({
					...item,
					product: item.article ? {
						title: item.article.label,
						description: item.article.description,
						image_url: item.article.photo
					} : null
				}))
			}))
		} catch (error) {
			console.error('Error fetching partner orders:', error)
			throw error
		}
	},

	// Validate partner order
	validatePartnerOrder: async (orderId) => {
		try {
			const { error } = await supabase
				.from('commande')
				.update({ status: 'validated' })
				.eq('id', orderId)

			if (error) throw error
		} catch (error) {
			console.error('Error validating order:', error)
			throw error
		}
	}
}
