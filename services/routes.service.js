class RoutesService {
  constructor() {
    this.routes = [
      {
        id: 1,
        name: "Ruta Centro-Norte",
        description: "Ruta desde el centro histórico hacia el norte",
        coordinates: [[21.1234, -101.6845], [21.1350, -101.6902], [21.1450, -101.6950], [21.1550, -101.7000]]
      },
      {
        id: 2,
        name: "Ruta Comercial",
        description: "Recorrido por principales centros comerciales",
        coordinates: [[21.1168, -101.6824], [21.1200, -101.6750], [21.1280, -101.6800], [21.1250, -101.6900]]
      },
      {
        id: 3,
        name: "Ruta Escolar",
        description: "Ruta que conecta instituciones educativas",
        coordinates: [[21.1526, -101.7110], [21.1480, -101.7050], [21.1420, -101.7000], [21.1350, -101.6950]]
      },
      {
        id: 4,
        name: "Ruta Turística",
        description: "Recorrido por puntos de interés turístico",
        coordinates: [[21.1234, -101.6845], [21.1350, -101.6902], [21.1168, -101.6824], [21.1526, -101.7110]]
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
