class RoutesService {
  constructor() {
    this.routes = [
      {
        id: 1,
        name: "School Route",
        coordinates: [
          [21.12, -101.68],
          [21.13, -101.69],
          [21.14, -101.70]
        ]
      },
      {
        id: 2,
        name: "Downtown Route",
        coordinates: [
          [21.125, -101.685],
          [21.130, -101.690],
          [21.135, -101.695]
        ]
      },
      {
        id: 3,
        name: "University Transport Route",
        coordinates: [
          [21.150, -101.710],
          [21.155, -101.715],
          [21.160, -101.720]
        ]
      }
    ];
  }

  async create(data) {
    const newRoute = {
      id: this.routes.length + 1,
      ...data
    };

    this.routes.push(newRoute);

    return {
      message: "Route created successfully",
      data: newRoute,
      id: newRoute.id
    };
  }

  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.routes);
      }, 1000);
    });
  }

  async getById(id) {
    return this.routes.find(route => route.id == id);
  }

  async update(id, changes) {
    const index = this.routes.findIndex(route => route.id == id);

    if (index === -1) {
      throw new Error("Route not found");
    }

    this.routes[index] = {
      ...this.routes[index],
      ...changes
    };

    return this.routes[index];
  }

  async delete(id) {
    const index = this.routes.findIndex(route => route.id == id);

    if (index === -1) {
      throw new Error("Route not found");
    }

    const deletedRoute = this.routes.splice(index, 1);

    return deletedRoute[0];
  }
}

module.exports = RoutesService;
