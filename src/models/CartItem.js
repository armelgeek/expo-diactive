export class CartItem {
    constructor(id, productId, quantity, pointsCost) {
      this.id = id;
      this.product_id = productId;
      this.quantity = quantity;
      this.points_cost = pointsCost;
    }
}