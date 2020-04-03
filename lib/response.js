const response = module.exports = {
    get body() {
        return this._body
    },

    set body(value) {
        this.res.statusCode = 200
        this._body = value
    }
}