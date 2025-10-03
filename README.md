# brainfuck-js
This Project let you run brainfuck code in Javascript

## How to use it
### Node.js
#### Installation
Use npm to install the package:
```bash
npm install brainfuck-js
```
Then, you can use it in your Node.js.

If you just want the result returned as a string:
```javascript
const brainfuck = require('brainfuck-js');
const code = ',[.+].';
const input = 'f';
const output = brainfuck(code, input);
```
#### Output:
```javascript
'odqwdjwo'
```
<br><br>
If you want to get more detailed output printed on the console, you can add the `true` as the third argument:
```javascript
const brainfuck = require('brainfuck-js');
const code = ',[.+].';
const input = 'f';
const output = brainfuck(code, input, true);
```
#### Console Output:
```bash> Running Brainfuck code...
> Code: ,[.+].
```

#### Output:
```javascript
'odqwdjwo'
```
