export class Profile {
    constructor(userId, avatarUrl, totalSteps, totalPoints) {
      this.user_id = userId;
      this.avatar_url = avatarUrl;
      this.total_steps = totalSteps;
      this.total_points = totalPoints;
    }
  }