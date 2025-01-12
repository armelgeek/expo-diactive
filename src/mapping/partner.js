export class PartnerMapper {
	static toPartner(partner) {
		if (!partner) return null
		const mappedPartner = {
			...partner,
			company_name: partner.nom,
			logo_url: partner.logo,
			category_id: partner.type_id
		}

		// Remove old fields
		delete mappedPartner.nom
		delete mappedPartner.logo
		delete mappedPartner.type_id
		delete mappedPartner.type

		return mappedPartner
	}

	static toCategory(category) {
		if (!category) return null
		return {
			...category,
			name: category.label
		}
	}

	static toProduct(article) {
		if (!article) return null
		return {
			...article,
			title: article.label,
			description: article.description,
			image_url: article.photo,
			points_cost: article.points_cost,
			available: article.quantity > 0
		}
	}

	static toOrder(order) {
		if (!order) return null
		return {
			...order,
			partner: order.partner ? this.toPartner(order.partner) : null,
			order_items: order.command_items?.map(item => ({
				...item,
				product: item.article ? this.toProduct(item.article) : null
			}))
		}
	}

	static toPartnerList(partners) {
		if (!partners) return []
		return partners.map(partner => this.toPartner(partner))
	}

	static toCategoryList(categories) {
		if (!categories) return []
		return categories.map(category => this.toCategory(category))
	}

	static toProductList(articles) {
		if (!articles) return []
		return articles.map(article => this.toProduct(article))
	}

	static toOrderList(orders) {
		if (!orders) return []
		return orders.map(order => this.toOrder(order))
	}
}

