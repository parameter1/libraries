export class ServiceRegistry {
  /**
   *
   * @param {object} params
   * @param {console.log} params.log
   * @param {import("./service.js").FastifyService[]} params.services
   */
  constructor({ log, services = [] } = {}) {
    this.log = log;
    this.services = services;
  }

  logInitData() {
    this.services.map((service) => service.logOnInit({ log: this.log }));
  }

  async probeHealth() {
    const results = await Promise.all(this.services.map((service) => service.probeHealth()));
    return results.filter((result) => result);
  }

  /**
   *
   * @param {import("./service.js").FastifyServiceActionEnum} action
   */
  async run(action) {
    await Promise.all(this.services.map((service) => service.run({ action, log: this.log })));
  }
}
