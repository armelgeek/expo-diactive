export class Donation {
    constructor(id, userId, instituteId, pointsAmount, createdAt) {
      this.id = id;
      this.user_id = userId;
      this.institute_id = instituteId;
      this.points_amount = pointsAmount;
      this.created_at = createdAt;
    }
  }