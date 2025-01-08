export class Review {
    constructor(id, userId, partnerId, rating, comment, createdAt) {
      this.id = id;
      this.userId = userId;
      this.partnerId = partnerId;
      this.rating = rating;
      this.comment = comment;
      this.createdAt = createdAt;
    }
  }