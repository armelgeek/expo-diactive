export class Donation {
    constructor(id, userId, instituteId, pointsAmount, createdAt) {
      this.id = id;
      this.userId = userId;
      this.instituteId = instituteId;
      this.pointsAmount = pointsAmount;
      this.createdAt = createdAt;
    }
  }