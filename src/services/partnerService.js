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

		if (data) {
			data.map(item => {
				item.company_name = item.nom,
					item.logo_url = item.logo,
					item.category_id = item.type_id,
					item.nom = undefined,
					item.logo = undefined,
					item.type_id = undefined,
					item.type = undefined

				return item
			})
		}

		if (error) throw error
		return data
	},

	// Get partner categories
	getPartnerCategories: async () => {
		const { data, error } = await supabase
			.from('partner_type')
			.select('*')
			.order('label')

		if (data) {
			data.map(item => {
				item.name = item.label
				return item
			})
		}
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
			// Récupérer d'abord les commandes
			const { data: orders, error: ordersError } = await supabase
				.from('commande')
				.select(`
					id,
					created_at,
					type,
					total_points,
					partner_id,
				`)
				.eq('partner_id', partnerId)
				.order('created_at', { ascending: false });

			if (ordersError) throw ordersError;

			// Pour chaque commande, récupérer les items
			const ordersWithItems = await Promise.all(orders.map(async (order) => {
				const { data: items, error: itemsError } = await supabase
					.from('command_items')
					.select(`
						id,
						quantite,
						point_cost,
						product_id,
						reward_id
					`)
					.eq('commande_id', order.id);

				if (itemsError) throw itemsError;

				// Pour chaque item, récupérer l'article ou la récompense associée
				const itemsWithDetails = await Promise.all(items.map(async (item) => {
					let product = null;
					if (item.article_id) {
						const { data: article, error: articleError } = await supabase
							.from('article')
							.select('label, description, photo')
							.eq('id', item.product_id)
							.single();

						if (articleError) throw articleError;
						product = {
							title: article.label,
							description: article.description,
							image_url: article.photo
						};
					}

					let reward = null;
					if (item.reward_id) {
						const { data: rewardData, error: rewardError } = await supabase
							.from('reward')
							.select('label, description, image')
							.eq('id', item.reward_id)
							.single();

						if (rewardError) throw rewardError;
						reward = {
							title: rewardData.label,
							description: rewardData.description,
							image_url: rewardData.image
						};
					}

					return {
						id: item.id,
						quantity: item.quantite,
						points_cost: item.point_cost,
						product,
						reward
					};
				}));

				// Récupérer les infos du partenaire
				const { data: partner, error: partnerError } = await supabase
					.from('partner')
					.select('nom, description')
					.eq('id', order.partner_id)
					.single();

				if (partnerError) throw partnerError;

				return {
					...order,
					status: order.type,
					total_points: order.total_price,
					partner: {
						...partner,
						company_name: partner.nom,

					},
					command_items: itemsWithDetails
				};
			}));

			return ordersWithItems;
		} catch (error) {
			console.error('Error fetching partner orders:', error);
			throw error;
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
