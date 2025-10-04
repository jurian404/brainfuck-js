# brainfuck-js
This Project let you run brainfuck code in Javascript

## Installation
Use npm to install the package
```bash
npm i @jurian.w/bf-js
```

## Usage

### Default Output
If you just want the result returned as a string you can use the `run()` function:
```javascript
const bf = require("@jurian.w/bf-js");
const code = ",.+.";
const input = "A";

console.log(bf.run(code, input))
```
#### Output:
```javascript
'AB'
```

### More Detailed Output
If you want more detailed output, including the integer values of the output characters, you can use the `runDetailedInfo()` function:
```javascript
const bf = require("@jurian.w/bf-js");
const code = ",.+.";
const input = "A";

console.log(bf.runDetailedInfo(code, input))
```
#### Output:
```javascript>
[ { char: 'A', code: 65 }, { char: 'B', code: 66 } ]
```

### Debug Output
If you just want to use it to debug your frainfuck code, you can use the `runWithFeedback()` function:
```javascript
const bf = require("@jurian.w/bf-js");
const code = ",.+.";
const input = "A";

console.log(bf.runWithFeedback(code, input))
```
#### Console Output:
````bash>
Finished build and ready to run after: 0.059ms
Script structure:
1| ,
2| .
3| >
4| Loop:
   1| +
   2| -
   3| -
5| <
6| +
7| .
Finished storage setup after: 0.026ms
out:  65  -->  A
out:  66  -->  B
Successfully finished script after: 0.172ms
````

#### Output:
```javascript>
[ { char: 'A', code: 65 }, { char: 'B', code: 66 } ]
```