const Koa = require('../lib/application')

const app = new Koa()

app.use((ctx, next) => {
    console.log('hi')
})

app.listen(3000)