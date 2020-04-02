const request = module.exports = {
  /**
   * 这里的关键点在于this指向
   * 由于在
   * ctx.request.__proto__ === this.request
   */
  get url() {
    return this.req.url;
  }
};
