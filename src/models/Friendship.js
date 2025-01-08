export class Friendship {
    constructor(id, userId, friendId, status) {
      this.id = id;
      this.user_id = userId;
      this.friend_id = friendId;
      this.status = status; // 'accepted', 'pending', 'rejected'
    }
  }