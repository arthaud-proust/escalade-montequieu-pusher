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
        // have() doesn't work with nested array
        if(!this.have(item))
            this._array.push(item)
    }
    addOnceObj(newObj, props) {
        // fix problem
        // and fix seen list problem
        let exist = [];
        for (let i=0; i<props.length; i++) {
            exist.push(this._array.findIndex(obj => obj[props[i]] == newObj[props[i]] )!==-1)
        }

        if (!exist.includes(true))
            this._array.push(newObj);
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