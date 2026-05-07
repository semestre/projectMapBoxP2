class ZonesService {
  constructor() {
    this.zones = [
      {
        id: 1,
        name: "Zona Centro Histórico",
        description: "Centro histórico de León con edificios coloniales",
        coordinates: [[21.1350, -101.6902], [21.1380, -101.6850], [21.1320, -101.6820], [21.1290, -101.6880]]
      },
      {
        id: 2,
        name: "Zona Industrial",
        description: "Área industrial principal de la ciudad",
        coordinates: [[21.1100, -101.7200], [21.1150, -101.7150], [21.1200, -101.7250], [21.1180, -101.7300]]
      },
      {
        id: 3,
        name: "Zona Comercial",
        description: "Área comercial con centros comerciales",
        coordinates: [[21.1200, -101.6750], [21.1250, -101.6700], [21.1280, -101.6800], [21.1230, -101.6850]]
      },
      {
        id: 4,
        name: "Zona Residencial",
        description: "Zona residencial de expansión urbana",
        coordinates: [[21.1450, -101.6600], [21.1500, -101.6550], [21.1550, -101.6650], [21.1500, -101.6750]]
      }
    ];
  }

  async create(data) {
    const newZone = {
      id: this.zones.length + 1,
      ...data
    };

    this.zones.push(newZone);

    return {
      message: "Zone created successfully",
      data: newZone,
      id: newZone.id
    };
  }

  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.zones);
      }, 1000);
    });
  }

  async getById(id) {
    return this.zones.find(zone => zone.id == id);
  }

  async update(id, changes) {
    const index = this.zones.findIndex(zone => zone.id == id);

    if (index === -1) {
      throw new Error("Zone not found");
    }

    this.zones[index] = {
      ...this.zones[index],
      ...changes
    };

    return this.zones[index];
  }

  async delete(id) {
    const index = this.zones.findIndex(zone => zone.id == id);

    if (index === -1) {
      throw new Error("Zone not found");
    }

    const deletedZone = this.zones.splice(index, 1);

    return deletedZone[0];
  }
}

module.exports = ZonesService;
