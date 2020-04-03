const http = require("http");
const EventEmitter = require("events");
const context = require("./context");
const request = require("./request");
const response = require("./response");

class Moa extends EventEmitter {
  constructor() {
    super();
    this.fn = {};
    this.context = context;
    this.request = request;
    this.response = response;
  }

  /**
   * 创建上下文，将req/res等属性方法挂在ctx上
   */
  createContext(req, res) {
    // Object.create 目的为了继承但不影响原有对象
    const ctx = Object.create(this.context);
    const request = (ctx.request = Object.create(this.request));
    const response = (ctx.response = Object.create(this.response));
    ctx.req = request.req = response.req = req;
    ctx.res = request.res = response.res = res;
    request.ctx = response.ctx = ctx;
    request.response = response;
    response.request = request;
    return ctx;
  }

  /**
   * 中间件函数
   */
  use(fn) {
    this.fn = fn;
  }

  /**
   * 处理http模块的req/res函数
   */
  handleRequest(req, res) {
    const ctx = this.createContext(req, res);
    this.fn(ctx);
    res.end(ctx.body);
  }

  listen(...args) {
    const server = http.createServer(this.handleRequest.bind(this));
    server.listen(...args);
  }
}

module.exports = Moa;
