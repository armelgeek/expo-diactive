export class Marketplace {
    constructor(id, name, description, products = [], partners = []) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.products = products; 
      this.partners = partners;
    }
  }