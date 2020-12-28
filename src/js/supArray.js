module.exports = class supArray {
    constructor() {
        this._array = [];
    }

    get items() {
        return this._array
    }

    add(item) {
        this._array.push(item)
    }
    addOnce(item) {
        if(!this.have(item))
            this._array.push(item)
    }

    remove(item) {
        const index = this._array.indexOf(item);
        if (index > -1) {
            this._array.splice(index, 1);
        }
    }

    nestedRemove(key, value) {
        const index = this._array.findIndex(el => el[key] == value )
        this._array.splice(index, 1);
    }

    empty() {
        this._array = [];
    }

    set(arr) {
        this._array = arr;
    }

    have(item) {
        return this._array.includes(item)
    }

    getKeys(key) {
        var arr = [];
        for(let i=0; i<this._array.length; i++) {
            arr.push(this._array[i][key])
        }
        return arr;
    }
}