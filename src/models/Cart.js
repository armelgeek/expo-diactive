export class Cart {
    constructor(id, userId, items = []) {
      this.id = id;
      this.user_id = userId;
      this.items = items; // Array of CartItem
    }
}
