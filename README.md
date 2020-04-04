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

### 中间件compose实现

use多个中间件的场景如下，在next函数执行时，跳出当前中间件，到下一个中间件继续执行

```javascript
app.use(async (ctx, next) => {
    console.log(1)
    await next()
    console.log(2)
})
app.use(async (ctx, next) => {
    console.log(3)
    let p = new Promise((resolve, roject) => {
        setTimeout(() => {
            console.log('3.5')
            resolve()
        }, 1000)
    })
    await p.then()
    await next()
    console.log(4)
    ctx.body = 'hello world'
})
```

思路：
1. 每个use调用时，将函数存放在一个koa实例的中间件数组维护
2. 对于洋葱模型的机制，也就是next的实现，采用递归调用中间件数组里的函数，将下一个中间件函数作为当前中间件的next形参执行
3. promise包装next返回函数，可以实现异步

```javascript
compose(middlewares, ctx) {
    function dispatch(index) {
        // 最后一个中间件不需要执行next，所以直接退出
        if(index === middlewares.length) {
            return Promise.resolove()
        }
        const middleware = middlewares[index]
        // 这里传入ctx和下一个被执行的中间件函数
        // 对应app.use的两个形参ctx、next，后者() => dispatch(index + 1)当next()被调用，也就达到了按顺序执行目的
        return Promise.resolve(middleware(ctx, () => dispatch(index + 1)))
    }

    dispatch(0)
}
// 在每一个请求过来时，洋葱模型开始执行，调用compose(middlewares, ctx)
```