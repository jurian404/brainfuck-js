const readline = require("readline");
const containerLimit = 256;

function createWaitForEnter() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return async function wait(message = "Press enter to show next step") {
        return new Promise(resolve => {
            rl.question(message, () => {
                readline.moveCursor(process.stdout, 0, 0);
                readline.clearLine(process.stdout, 0);
                resolve();
            });
        });
    };
}

function showMemory() {
    const used = process.memoryUsage();
    console.log('RAM Usage:');
    for (let key in used) {
        console.log(`${key.padEnd(12)} ${(used[key] / 1024 / 1024).toFixed(2)} MB`);
    }
}


class Logger{
    constructor(code, input, container){
        this._container = container;
        this._code = code;
        this._input = input;
        this._logs = [];
    }

    addEntry(){
        const newEntry = new LoggerEntry(this._container, this);
        this._logs.push(newEntry);
        return newEntry;
    }

    setError(){
        this._error = true;
    }

    showLog(){
        const result = [];
        for(const entry of this._logs){
            entry.getLog(result, this._code, this._input);
            const newChar = entry.getNewChar();
            if(newChar){
                result.push(newChar);
            }
        }
        console.log("------------------------------------------------");
    }

    async showLogStepByStep(){
        const result = [];
        console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
        const waitForEnter = createWaitForEnter();
        for(const entry of this._logs){
            console.log("\x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A\x1b[2K \x1b[1A")
            entry.getLog(result, this._code, this._input);
            const newChar = entry.getNewChar();
            console.log("------------------------------------------------")
            if(newChar){
                result.push(newChar);
            }
            await waitForEnter();
        }
        process.stdin.pause();
    }
}

class LoggerEntry{
    constructor(container, logger){
        this._container = container;
        this._logger = logger;
        this._pointerPosition = 0;
        this._inputPosition = 0;
        this._preContainerState = [];
        this._preSelectedContainer = null;
        this._postContainerState = [];
        this._postSelectedContainer = null;
        this._actionMessage = '';
        this._containerMessage = 'Keep selected';
        this._newChar = null;
        this._isError = false;
    }

    setPointerPosition(position){
        this._pointerPosition = position;
    }

    setInputPosition(position){
        this._inputPosition = position;
    }

    createPreState(){
        const info = this._container.getDebugInfo();
        this._preContainerState = info.value.map(e => e.get());
        this._preSelectedContainer = info.position;
    }

    createPostState(){
        const info = this._container.getDebugInfo();
        this._postContainerState = info.value.map(e => e.get());
        this._postSelectedContainer = info.position;
    }

    setActionMessage(message){
        this._actionMessage = message;
    }

    setContainerMessage(message){
        this._containerMessage = message;
    }

    setNewChar(char){
        this._newChar = char;
    }

    getNewChar(){
        return this._newChar;
    }

    setError(){
        this._isError = true;
        this._logger.setError();
    }

    getLog(prelog, code, input){
        console.log("------------------------------------------------\nCode progress:");
        console.log(' '.repeat(this._pointerPosition - 1) + "↓");
        console.log(code);
        console.log("Input progress:");
        console.log(' '.repeat(this._inputPosition) + "↓");
        console.log(input);
        this._isError? console.error(this._actionMessage): console.log(this._actionMessage)
        console.log(this._formatStorage(this._preContainerState, this._preSelectedContainer));
        console.log(this._preContainerState.map(e => '[' + e + ']').join(''));
        console.log(this._formatStorage(this._postContainerState, this._postSelectedContainer, this._containerMessage));
        console.log(this._postContainerState.map(e => '[' + e + ']').join('') + '\n\n Current output:');
        console.log(`${JSON.stringify(prelog.map(e => e.string()).join(""))} ${this._newChar? `← ${JSON.stringify(this._newChar.string())} Ascii ${this._newChar.int()}`: ""}`)
    }

    _formatStorage(container, selected, naming = 'Selected'){
        const allBeforeSelector = container.slice(0, selected).map(item => item.toString()).join('').length + (selected) * 2 + 1;
        return ' '.repeat(allBeforeSelector) + '↓ ' + naming;
    }
}

class Container{
    constructor(value){
        this._verifySet(value);
    }
    _verifySet(value){
        switch (typeof value) {
            case 'string':
                this._range(this._returnAsAscii(value));
                break;
            case 'number':
                this._range(value);
                break;
            default:
                this.value = 0;
        }
    }

    _range(value){
        this.value = ((value % containerLimit) + containerLimit) % containerLimit;
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

    get(){
        return this.value;
    }

    read(){
        return this._returnAsAsciiChar(this.value);
    }

    up(){
        this._range(this.value + 1);
    }

    down(){
        this._range(this.value - 1);
    }
}

class Value{
    constructor(value){
        this._value = value;
    }

    string(){
        return String.fromCharCode(this._value);
    }

    int(){
        return this._value;
    }
}

class Command{
    constructor(cmd, id){
        this.cmd = cmd;
        this.id = id;
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

    getDebugInfo(){
        return {
            position: this.selected,
            value: this._rows
        }
    }
}

class Runner{
    constructor(parent){
        this._parent = parent;
        this._values = [];
    }

    add(char){
        this._values.push(char);
    }

    createChild(i){
        const child = new Loop(this);
        this._values.push(new Command(child, i));
        return child;
    }

    getParent(){
        return this._parent;
    }

    _run(storage, string, index, loopLimit, feedback, logger){
        const result = [];
        for(const command of this._values){
            const logEntry = logger? logger.addEntry(): null;
            if(logEntry){
                logEntry.setPointerPosition(command.id + 1);
                logEntry.createPreState();
                logEntry.setInputPosition(index);
            }
            if(command.cmd instanceof Loop || command.cmd instanceof Runner){
                if(logger){
                    logEntry.setActionMessage('Entering loop');
                    logEntry.createPostState();
                }
                result.push(...command.cmd.run(storage, string, index, loopLimit, feedback, logger, command.id + 2 + command.cmd.getSubCommandLength()))
            } else if (typeof command.cmd === 'string'){
                switch (command.cmd){
                    case ">":
                        storage.right();
                        if(logger){
                            logEntry.setActionMessage('Switch to right container');
                            logEntry.setContainerMessage('New selected container');
                        }
                        break;
                    case "<":
                        storage.left();
                        if(logger){
                            logEntry.setActionMessage('Switch to left container');
                            logEntry.setContainerMessage('New selected container');
                        }
                        break;
                    case "+":
                        storage.container().up();
                        if(logger){
                            logEntry.setActionMessage('Increase Storage value');
                            logEntry.setContainerMessage('Added 1');
                        }
                        break;
                    case "-":
                        storage.container().down();
                        if(logger){
                            logEntry.setActionMessage('Decline Storage value');
                            logEntry.setContainerMessage('Subtracted 1');
                        }
                        break;
                    case ".":
                        const newOutput = new Value(storage.container().get());
                        if(logger){
                            logEntry.setActionMessage(`Select current char to output: ${JSON.stringify(newOutput.string())} with code ${newOutput.int()}`);
                            logEntry.setContainerMessage('Get current value');
                            logEntry.setNewChar(newOutput);
                        }
                        result.push(newOutput);
                        break;
                    case ",":
                        if(typeof string !== 'string'){
                            feedback? console.error(`ERROR: The input must be a string. Got ${typeof string}`): null;
                            logger? logEntry.setActionMessage(`ERROR: The input must be a string. Got ${typeof string}`): null;
                            logger? logEntry.setError(): null;
                            result.push(false)
                        } else {
                            const char = string[index] || '';
                            const value = char.charCodeAt(0);
                            index++;
                            console.log("index:", index, string, char);
                            if(char === ''){
                                feedback? console.error(`Warning: The input has no more characters to read. Just setting to 0.`): null;
                                logger? logEntry.setActionMessage(`Warning: The input has no more characters to read. Just setting to 0.`): null;
                                storage.container().set(0);
                                logger? logEntry.setContainerMessage(`Set to 0`): null;
                            } else {
                                logger? logEntry.setActionMessage(`Insert input value: ${JSON.stringify(char)} → ${value}`): null;
                                storage.container().set(value);
                                logger?logEntry.setContainerMessage(`Set to ${value}`): null;
                            }
                        }
                        break;
                    default:
                        feedback? console.error(`ERROR: The input must be a string. Got ${typeof string}`): null;
                        if(logger){
                            logEntry.setActionMessage(`ERROR: The input must be a string. Got ${typeof string}`);
                            logEntry.setError();
                            result.push(false)
                        }
                        break;
                }
                logger? logEntry.createPostState(): null
            }
        }
        return {res: result, i: index};
    }

    getSubCommandLength(){
        let length = 0;
        for(const command of this._values){
            if(command.cmd instanceof Loop || command.cmd instanceof Runner){
                length += (command.cmd.getSubCommandLength() + 2);
            } else {
                length ++;
            }
        }
        return length;
    }

    run(storage, input, index, loopLimit, feedback = true, logger = false, codeposition) {
        return this._run(storage, input, index, loopLimit, feedback, logger);
    }

    structure(level = 0){
        const indent = ' '.repeat(level * 3);
        let backspaceLength = this._values.length.toString().length;
        let i = 0;
        for(const command of this._values){
            const task = command.cmd;
            i ++;
            if(typeof task === 'object'){
                if(task instanceof Runner || task instanceof Loop){
                    console.log(`${indent}${i}${' '.repeat(backspaceLength - i.toString().length)}| Loop:`);
                    task.structure(level + 1);
                }
            } else {
                console.log(`${indent}${i}${' '.repeat(backspaceLength - i.toString().length)}| ${task}`);
            }
        }
    }
}

class Loop extends Runner{
    constructor(parent){
        super(parent);
    }

    run(storage, input, index, loopLimit, feedback, logger, codePosition){
        const results = []
        let i = 0;
        while (storage.container().get() !== 0){
            i++;
            if(i > loopLimit){
                feedback? console.error(`ERROR: Too many loops. Limit is ${i}`): null;
                if(logger){
                    const logEntry = logger.addEntry();
                    logEntry.setPointerPosition(codePosition);
                    logEntry.setInputPosition(index);
                    logEntry.createPostState();
                    logEntry.createPreState();
                    logEntry.setActionMessage(`ERROR: Reached max amount of loop: ${i - 1}. Possibly an endless loop. Leaving Loop`);
                }
                return results;
            }
            const res = this._run(storage, input, index, loopLimit, feedback, logger);
            index = res.i;
            results.push(...res.res);
        }
        if(logger){
            const logEntry = logger.addEntry();
            logEntry.setPointerPosition(codePosition);
            logEntry.setInputPosition(index);
            logEntry.createPostState();
            logEntry.createPreState();
            logEntry.setActionMessage('Leaving the loop')
        }
        return results;
    }
}

class BrainfuckInterpreter {
    constructor(){
        this._assembly = null;
        this._code = null;
        this._loopLimit = 2000;
    }

    _getResult(data, returnJustFalse = false, returnAll = false){
        const error = data.filter(e => e === false).length > 0
        if(returnJustFalse && error){
            return error;
        }
        const responses = data.filter(e => e !== false);
        const responseString = responses.map(e => e.string()).join('');
        if(returnAll){
            return {
                error: error,
                result: responseString,
                responses: responses.map((e) => {return {char: e.string(), int: e.int()}})
            }
        } else{
            return responseString;
        }
    }

    build(code, feedback = false){
        if(typeof code !== 'string'){
            feedback? console.error("ERROR: The code must be a string. Got ", typeof code): null;
            return false;
        }
        this._code = code;
        let currentElement = new Runner(null);
        this._assembly = currentElement;
        for ( let i = 0; i < code.length; i++){
            const currentCharacter = code[i];
            if(currentCharacter === '['){
                currentElement = currentElement.createChild(i);
            } else if (currentCharacter === ']'){
                currentElement = currentElement.getParent();
            } else{
                currentElement.add(new Command(currentCharacter, i));
            }
        }
        return true;
    }

    getStructure(feedback = false){
        if(this._assembly === null){
            feedback? console.error("ERROR: The code has not been built yet."): null;
            return false;
        }
        console.log("Script structure:");
        this._assembly.structure();
        console.log("End of script structure.");
        return true;
    }

    execute(input, feedback = false){
        try{
            if(this._assembly === null){
                return false;
            }
            const storage = new Storage();
            const result = this._assembly.run(storage, input, 0, this._loopLimit, feedback).res;
            return this._getResult(result);
        } catch (e){
            console.error("ERROR: Something went wrong. ", e);
            return false;
        }
    }

    executeAndShowFullLog(input, feedback = false){
        try{
            if(this._assembly === null){
                return false;
            }
            const storage = new Storage();
            const logger = new Logger(this._code, input, storage);
            const result = this._assembly.run(storage, input, 0, this._loopLimit, feedback, logger).res;
            logger.showLog();
            showMemory();
            const resultObj = this._getResult(result, false, true);
            console.log(`\n${resultObj.error? "There were errors during execution": "Execution completed successfully"}.\nFinal output: ${JSON.stringify(resultObj.result)}\n`);
            return resultObj;
        } catch (e){
            console.error("ERROR: Something went wrong. ", e);
            return false;
        }
    }

    async executeAndShowStepByStepRePlay(input, feedback = false){
        try{
            if(this._assembly === null){
                return false;
            }
            const storage = new Storage();
            const logger = new Logger(this._code, input, storage);
            const result = this._assembly.run(storage, input, 0, this._loopLimit, feedback, logger).res;
            showMemory();
            await logger.showLogStepByStep();
            const resultObj = this._getResult(result, false, true);
            console.log(`\n${resultObj.error? "There were errors during execution": "Execution completed successfully"}.\nFinal output: ${JSON.stringify(resultObj.result)}\n`);
            return resultObj;
        } catch (e){
            console.error("ERROR: Something went wrong. ", e);
            return false;
        }
    }

    setLoopLimit(limit, feedback = false){
        if(typeof limit !== 'number'){
            feedback? console.error("ERROR: The limit must be a number. Got ", typeof limit): null;
            return false;
        }
        if(limit <= 0){
            feedback? console.error("ERROR: The limit must be a positive number. Got ", limit): null;
            return false;
        }
        this._loopLimit = limit;
        return true;
    }
}

module.exports = BrainfuckInterpreter;