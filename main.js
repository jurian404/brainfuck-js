const containerLimit = 256;
const loopLimit = 100000;

class Container{
    constructor(value){
        this._verifySet(value);
    }
    _verifySet(value){
        switch (typeof value) {
            case 'string':
                this._checkForRange(this._returnAsAscii(value));
                break;
            case 'number':
                this._checkForRange(value);
                break;
            case 'boolean':
                this._checkForRange(value === true);
                break;
            default:
                this.value = 0;
        }
    }

    _checkForRange(value){
        value %= containerLimit;
        if(value >= 0){
            this.value = value;
        } else {
            this.value = containerLimit + value;
        }
        return this.value;
    }

    _returnAsAscii (char) {
        return char.charCodeAt(0);
    }

    _returnAsAsciiChar (number){
        return String.fromCharCode(number);
    }

    set(value){
        this._verifySet(value);
    }

    get (){
        return this.value;
    }

    read(){
        return this._returnAsAsciiChar(this.value);
    }

    up(){
        this._checkForRange(this.value + 1);
    }

    down(){
        this._checkForRange(this.value - 1);
    }
}

class Storage{
    constructor(){
        this._rows = [new Container()];
        this.selected = 0;
    }

    right(){
        if(this.selected + 2 > this._rows.length){
            this._rows.push(new Container());
        }
        this.selected++;
    }

    left(){
        if(this.selected === 0){
            this.selected = this._rows.length - 1;
        } else {
            this.selected--;
        }
    }

    container(){
        return this._rows[this.selected];
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

    _run(storage, input, feedback = false){
        const result = [];
        for(const task of this._values){
            if(typeof task === 'object'){
                if(task instanceof Runner || task instanceof Loop){
                    const res = task.run(storage, input, feedback);
                    if(res === false){
                        return false;
                    }
                    result.push(...res);
                }
            } else if (typeof task === 'string'){
                switch (task){
                    case ">":
                        storage.right();
                        break;
                    case "<":
                        storage.left();
                        break;
                    case "+":
                        storage.container().up();
                        break;
                    case "-":
                        storage.container().down();
                        break;
                    case ".":
                        const char = storage.container().read();
                        const code = storage.container().get();
                        feedback? console.log("out: ", code, " --> ",  char): null;
                        result.push({char: char, code: code});
                        break;
                    case ",":
                        if(typeof input !== 'string'){
                            if(feedback){
                                console.error(`ERROR: The input must be a string. Got ${typeof input}`);
                            }
                            return false;
                        }else if(input.length === 0){
                            if(feedback){
                                console.error(`ERROR: The input must be defined to insert the input. Got "${input}"`);
                            }
                            return false;
                        }else if(input.length !== 1){
                            if(feedback){
                                console.error(`ERROR: The input must be a single character. Got "${input}"`);
                            }
                            return false;
                        }
                        storage.container().set(input);
                        break;
                    default:
                        feedback? console.warn("WARNING: Invalid value ", task, "\n Skipping this command."): null;
                        break;
                }
            }
        }
        return result;
    }

    run(storage, input, feedback = false){
        const result = this._run(storage, input, feedback);
        if(result){
            return result;
        }
        return false;
    }
}

class Loop extends Runner{
    constructor(parent){
        super(parent);
    }

    run(storage, input, feedback = false){
        const result = [];
        let counter = 0;
        while (storage.container().get() !== 0){
            counter += 1;
            if(counter > loopLimit){
                feedback? console.log(`ERROR: The max amount of loops has reached: ${counter} \n Looks like a infinite loop - stopping execution.`): null;
                return false;
            }
            const res = this._run(storage, input, feedback);
            if(res === false){
                return false;
            }
            result.push(...res);
        }
        return result;
    }
}

function builder(script){
    const main = new Runner();
    let currentElement = main;
    for ( let i = 0; i < script.length; i++){
        const currentCharacter = script[i];
        if(currentCharacter === '['){
            currentElement = currentElement.createChild();
        } else if (currentCharacter === ']'){

            currentElement = currentElement.closePart();
        } else{
            currentElement.addCharacter(currentCharacter);
        }
    }
    return main;
}

function runWithFeedback(code, input){
    try{
        console.time('Finished build and ready to run after');
        const built = builder(code);
        console.timeEnd('Finished build and ready to run after');
        console.time('Finished storage setup after');
        const storage = new Storage();
        console.timeEnd('Finished storage setup after');
        console.time('Successfully finished script after');
        const res = built.run(storage, input, true);
        console.timeEnd('Successfully finished script after');
        return res;
    } catch (e){
        console.error("ERROR: Something went wrong. ", e);
        return false;
    }
}

function run(code, input){
    try{
        const result = runDetailedInfo(code, input);
        if(result === false){
            return null;
        }
        return result.map(e => e.char).join('');
    } catch (e){
        console.error("ERROR: Something went wrong. ", e);
    }
}

function runDetailedInfo(code, input){
    try{
        const built = builder(code);
        const storage = new Storage();
        return built.run(storage, input);
    } catch (e){
        console.error("ERROR: Something went wrong. ", e);
    }
}


module.exports = {run, runDetailedInfo, runWithFeedback};

console.log(run(",.[.-]", "9"));
console.log("next ->>>");
console.log(runDetailedInfo(",.[.-]", "9"));
console.log("next ->>>");
console.log(runWithFeedback(",.[.-]", "9"));