// src/models/OrderItem.js
export class OrderItem {
    constructor(id, orderId, rewardId, productId, quantity, pointsCost) {
      this.id = id;
      this.orderId = orderId;
      this.rewardId = rewardId;
      this.productId = productId;
      this.quantity = quantity;
      this.pointsCost = pointsCost;
    }
  }