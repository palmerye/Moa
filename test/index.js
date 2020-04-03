const Koa = require('../lib/application')

const app = new Koa()

app.use((ctx, next) => {
    ctx.response.body = 'hi'
})

app.listen(3000)