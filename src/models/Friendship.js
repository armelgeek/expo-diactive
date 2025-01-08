export class Friendship {
    constructor(id, userId, friendId, status) {
      this.id = id;
      this.userId = userId;
      this.friendId = friendId;
      this.status = status; // 'accepted', 'pending', 'rejected'
    }
  }