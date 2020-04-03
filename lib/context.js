const prop = module.exports = {

    
}

function defineGetter (prop, name) {
    prop.__defineGetter__(name, function () {
        return this[prop][name]
    })
}

defineGetter('request', 'url')