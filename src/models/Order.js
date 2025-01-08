export class Order {
    constructor(id, userId, partnerId, totalPoints, createdAt, updatedAt, type, completedAt) {
      this.id = id;
      this.userId = userId;
      this.partnerId = partnerId;
      this.totalPoints = totalPoints;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
      this.type = type; // e.g., 'reward', 'purchase'
      this.completedAt = completedAt;
    }
  }