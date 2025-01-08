export class Review {
    constructor(id, userId, partnerId, rating, comment, createdAt) {
      this.id = id;
      this.user_id = userId;
      this.partner_id = partnerId;
      this.rating = rating;
      this.comment = comment;
      this.created_at = createdAt;
    }
  }