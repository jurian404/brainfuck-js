# brainfuck-js
This Project let you run brainfuck code in Javascript

## How to use it
#### Installation
Use npm to install the package:
```bash
npm i @jurian.w/bf-js
```
Then, you can use it in your Node.js project.

If you just want the result returned as a string:
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
If you just want to use it to debug your frainfuck code, you can use the `runWithFeedback()` function:
```javascript
const bf = require("@jurian.w/bf-js");
const code = ",.+.";
const input = "A";

console.log(bf.runWithFeedback(code, input))
```
#### Console Output:
````bash>
Finished build and ready to run after: 0.045ms
Finished storage setup after: 0.022ms
out:  65  -->  A
out:  66  -->  B
Successfully finished script after: 0.152ms
````


#### Output:
```javascript>
[ { char: 'A', code: 65 }, { char: 'B', code: 66 } ]
```