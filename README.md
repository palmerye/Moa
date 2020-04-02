# Moa

> follow Koa.

## 手撸一个koa

### koa 框架分析

``` javascript
// koa
const Koa = require('koa');
const app = new Koa();

app.use((ctx, next) => {
  ctx.body = 'Hello World';
});

app.listen(3000); 

// http
const http = require('http');

const server = http.createServer((req, res) => {
  res.end('Hello World');
});

server.listen(3000);
```

可以看到koa框架就只有`listen/use/ctx/next`四个关键部分组成
- `listen`
    - 其实就是`http.createServer`的语法糖
- `ctx`
    - 上下文机制，将`req、res`处理后，加入大量扩展方法，方便使用
- `use`/`next`
    - 中间件机制，基于洋葱模型
    - `compose`函数，`next`跳到下一个中间件

