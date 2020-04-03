const http = require("http");
const Stream = require("stream");
const EventEmitter = require("events");
const context = require("./context");
const request = require("./request");
const response = require("./response");

class Moa extends EventEmitter {
  constructor() {
    super();
    this.middlewares = []; // 将use多个函数存放在数组里
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
   * 每次use都将函数存入数组
   */
  use(fn) {
    this.middlewares.push(fn)
  }

  /**
   * 处理http模块的req/res函数
   */
  handleRequest(req, res) {
    const ctx = this.createContext(req, res);
    res.statusCode = 404;
    const promise_fn = this.compose(this.middlewares, ctx); // 这里递归执行所有中间件
    promise_fn.then(() => {
        if (typeof ctx.body === 'object') {
            res.setHeader('Content-Type', 'application/json;charset=utf-8')
            res.end(JSON.stringify(ctx.body))
        } else if (typeof ctx.body === 'string') {
            res.setHeader('Content-Type', 'text/htmlcharset=utf-8')
            res.end(ctx.body)
        } else if (ctx.body instanceof Stream) {
            ctx.body.pipe(res)
        } else {
            res.end('Not found')
        }
    }).catch(err => {
        // 继承于EventEmitter，在app.on可以监听error事件
        this.emit('error', err)
        res.statusCode = 500;
        res.end('Server error!')
    })
    
  }

  /**
   * 中间件组合函数
   */
  compose(middlewares, ctx) {
    function dispatch(index) {
        if (index === middlewares.length) {
            // 递归到最后一个next函数，不用执行直接退出
            return Promise.resolve()
        }
        const middleware = middlewares[index]
        // 这里传入ctx和下一个被执行的中间件函数
        // 对应app.use的两个形参ctx、next，后者() => dispatch(index + 1)当next()被调用，也就达到了按顺序执行目的
        return Promise.resolve(middleware(ctx, () => dispatch(index + 1)))
    }
    return dispatch(0)
  }

  listen(...args) {
    const server = http.createServer(this.handleRequest.bind(this));
    server.listen(...args);
  }
}

module.exports = Moa;
