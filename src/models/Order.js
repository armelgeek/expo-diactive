export class Order {
    constructor(id, userId, partnerId, totalPoints, createdAt, updatedAt, type, completedAt) {
      this.id = id;
      this.userId = userId;
      this.partner_id = partnerId;
      this.total_points = totalPoints;
      this.created_at = createdAt;
      this.updated_at = updatedAt;
      this.type = type; // e.g., 'reward', 'purchase'
      this.completed_at = completedAt;
    }
  }
  