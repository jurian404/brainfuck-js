const containerLimit = 256;

class Slot{
    constructor(){
        this.value = 0;
    }
    _range(value) {
        this.value = ((value % containerLimit) + containerLimit) % containerLimit;
        return this.value;
    }

    set(value){
        this._range(value);
    }

    get (){
        return this.value;
    }

    up(){
        this._range(this.value + 1);
    }

    down(){
        this._range(this.value - 1);
    }
}

class Container{
    constructor(){
        this.slots = [new Slot()];
        this.selected = 0;
    }
    right(){
        if(this.selected + 1 >= this.slots.length){
            this.slots.push(new Slot());
        }
        this.selected++;
    }

    left(){
        if(this.selected === 0){
            this.selected = this.slots.length - 1;
        } else {
            this.selected--;
        }
    }

    current(){
        return this.slots[this.selected];
    }
}

class Runner{
    constructor(parent){
        this._parent = parent;
        this._values = [];
    }

    createChild(){
        const child = new Loop(this);
        this._values.push(child);
        return child;
    }

    closePart(){
        return this._parent
    }

    addCharacter(text){
        this._values.push(text);
    }
    _assemble(){
        const left = (container) => container.left();
        const right = (container) => container.right();
        const up = (container) => container.current().up();
        const down = (container) => container.current().down();
        const set = (container, string, i) => {container.current().set(string.charCodeAt(i) || 0);return {i: i + 1}};
        const get = (container) => {return {str: String.fromCharCode(container.current().get())}};
        const result = [];
        for(const task of this._values){
            if(typeof task === 'object'){
                if(task instanceof Runner || task instanceof Loop){
                    const res = task.assemble();
                    result.push(res);
                }
            } else if (typeof task === 'string'){
                switch (task){
                    case ">":
                        result.push(right);
                        break;
                    case "<":
                        result.push(left);
                        break;
                    case "+":
                        result.push(up);
                        break;
                    case "-":
                        result.push(down);
                        break;
                    case ".":
                        result.push(get);
                        break;
                    case ",":
                        result.push(set);
                        break;
                }
            }
        }

        return result;
    }

    assemble(){
        const assembly = this._assemble();
        return (container, string, index, loopLimit) =>{
            let result = '';
            for (const task of assembly){
                const res = task(container, string, index, loopLimit);
                if(res === false){
                    return false;
                }
                if(typeof res === 'object') {
                    if(res.i !== undefined){
                        index = res.i;
                    }
                    if(res.str !== undefined){
                        result += res.str;
                    }
                }
            }
            return {i: index, str: result};
        }
    }
}

class Loop extends Runner{
    constructor(parent){
        super(parent);
    }
    assemble() {
        const tasks = this._assemble();
        return (container, string, index, loopLimit) => {
            let i = 0;
            let result = '';
            while (container.current().get() !== 0) {
                i += 1;
                if (i > loopLimit) {
                    return false;
                }
                for (const task of tasks) {
                    const res = task(container, string, index, loopLimit);
                    if(res === false){
                        return false;
                    }
                    if(typeof res === 'object') {
                        if(res.i !== undefined){
                            index = res.i;
                        }
                        if(res.str !== undefined){
                            result += res.str;
                        }
                    }
                }
            }
            return {i: index, str: result};
        };
    }
}


class BrainfuckRunTimeTranspiler{
    constructor(){
        this._assembly = null;
        this._loopLimit = 2000;
    }

    transpile(code){
        if(typeof code !== 'string'){
            return false;
        }
        const main = new Runner();
        let currentElement = main;
        for(const char of code){
            if(char === '['){
                currentElement = currentElement.createChild();
            } else if (char === ']'){
                currentElement = currentElement.closePart();
            } else{
                currentElement.addCharacter(char);
            }
        }
        const assembled = main.assemble();
        if(assembled === false){
            return false;
        }
        this._assembly = assembled;
        return true;
    }

    run(input){
        if(this._assembly === null){
            return false;
        }
        if(!(typeof input === 'string')){
            return false;
        }
        const container = new Container();
        const result = this._assembly(container, input, 0, this._loopLimit).str;
        if(result === false){
            return false;
        }
        return result;
    }

    setLoopLimit(limit){
        if(typeof limit !== 'number' || limit <= 0){
            return false;
        }
        this._loopLimit = limit;
        return true;
    }
}

module.exports = BrainfuckRunTimeTranspiler;