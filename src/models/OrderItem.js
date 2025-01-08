export class OrderItem {
    constructor(id, orderId, rewardId, productId, quantity, pointsCost) {
      this.id = id;
      this.order_id = orderId;
      this.reward_id = rewardId;
      this.product_id = productId;
      this.quantity = quantity;
      this.points_cost = pointsCost;
    }
  }