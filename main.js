const Transpiler = require('./src/transpiler');
const Interpreter = require('./src/interpreter');

module.exports = {
    Transpiler,
    Interpreter,
}

const interpreter = new Interpreter();
interpreter.build(",+.,+.")
interpreter.executeAndShowStepByStepRePlay("ABC");