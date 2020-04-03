const Koa = require('../lib/application')

const app = new Koa()

app.use((ctx, next) => {
    ctx.body = 'hii'
})

app.listen(3000)