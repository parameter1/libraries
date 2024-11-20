/**
 * @typedef {("start"|"stop")} FastifyServiceActionEnum
 *
 * @typedef FastifyServiceHookLabel
 * @prop {string} running
 * @prop {string} finished
 *
 * @typedef {Object<string, FastifyServiceHookLabel>} FastifyServiceHookLabels
 */

/** @type {FastifyServiceHookLabels}  */
const labels = {
  start: { running: 'starting', finished: 'started' },
  stop: { running: 'stopping', finished: 'stopped' },
};

export class FastifyService {
  /**
   * @param {object} options
   * @param {string} options.name
   * @param {Function} [options.init]
   * @param {Function} [options.healthProbe]
   * @param {boolean} [options.logDataOnInit]
   * @param {Function} [options.start]
   * @param {Function} [options.stop]
   * @param {*} [options.data]
   */
  constructor({
    name,
    healthProbe,
    logDataOnInit,
    start,
    stop,
    data,
  }) {
    this.name = name;
    this.healthProbe = healthProbe;
    this.start = start;
    this.stop = stop;
    this.data = data;
    this.logDataOnInit = logDataOnInit;
  }

  /**
   *
   * @param {object} params
   * @param {console.log} params.log
   */
  logOnInit({ log }) {
    if (this.data && this.logDataOnInit) {
      log(`${this.name} ready`, this.data);
    }
  }

  async probeHealth() {
    if (typeof this.healthProbe === 'function') {
      await this.healthProbe();
      return { [this.name]: 'ok' };
    }
    return null;
  }

  /**
   *
   * @param {object} params
   * @param {FastifyServiceActionEnum} params.action
   * @param {console.log} params.log
   */
  async run({ action, log }) {
    const fn = this[action];
    if (typeof fn !== 'function') return;
    const label = labels[action];
    log(`${label.running} ${this.name}...`);
    await fn();
    log(`${label.finished} ${this.name}`, this.data || '');
  }
}
