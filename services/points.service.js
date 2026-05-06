class PointsService {
  constructor() {
    this.points = [
      {
      id: 1,
      name: "General Hospital",
      description: "24-hour service",
      lat: 21.1234,
      lng: -101.6845
    },
    {
      id: 2,
      name: "University Campus",
      description: "Main student area",
      lat: 21.1526,
      lng: -101.7110
    },
    {
      id: 3,
      name: "Shopping Mall",
      description: "Popular commercial area",
      lat: 21.1168,
      lng: -101.6824
    },
    {
      id: 4,
      name: "City Park",
      description: "Recreational green area",
      lat: 21.1350,
      lng: -101.6902
    }
    ];
  }

  async create(data) {
    const newPoint = {
      id: this.points.length + 1,
      ...data
    };

    this.points.push(newPoint);

    return {
      message: "Point created successfully",
      data: newPoint,
      id: newPoint.id
    };
  }

  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.points);
      }, 1000);
    });
  }

  async getById(id) {
    return this.points.find(point => point.id == id);
  }

  async update(id, changes) {
    const index = this.points.findIndex(point => point.id == id);

    if (index === -1) {
      throw new Error("Point not found");
    }

    this.points[index] = {
      ...this.points[index],
      ...changes
    };

    return this.points[index];
  }

  async delete(id) {
    const index = this.points.findIndex(point => point.id == id);

    if (index === -1) {
      throw new Error("Point not found");
    }

    const deletedPoint = this.points.splice(index, 1);

    return deletedPoint[0];
  }
}

module.exports = PointsService;
