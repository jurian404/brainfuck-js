# brainfuck-js
This Project let you run brainfuck code in Javascript

## Installation
Use npm to install the package
```bash
npm i @jurian.w/bf-js
```

## Usage

### Transpiler 
The transpiler can be used to run brainfuck code efficiently in Javascript.
It transpiles the brainfuck code to a Javascript function, which can be run multiple times with different input. <br>
#### Import and create transpiler instance
```javascript
const Transpiler = require("@jurian.w/bf-js/transpiler");
const transpiler = new Transpiler();
```

#### Transpile
You can transpile brainfuck code to a Javascript function using the `transpile()` method.
It needs your brainfuck code as a string as argument.

```javascript
const code = ",.+."; // Brainfuck code
const success = transpiler.transpile(code); // returns true if transpilation was successful
```

#### Run
After transpiling, you can run the transpiled code using the `run()` method.
It needs a string as argument that is a sequence of all input values.
It returns the output as a string. If there is a critical error, it returns `false`.
<br> Critical errors are:
- No code has been transpiled yet
- No input string has been provided
- Ran into an infinite loop (see [LoopLimit](#looplimit) for more information)

```javascript
const result = transpiler.run("ABC"); 
```

#### LoopLimit
To prevent infinite loops, there is a loop limit. The default is 2000 iterations per loop.
You can change this limit by setting the `loopLimit()` property of the transpiler instance.
It will change the limit for all future runs. <br>
It needs a positive integer as argument.

```javascript
const success = transpiler.setLoopLimit(250); // returns true if the limit was set successfully
```

### Interpreter
The interpreter can be used to translate brainfuck code while running it.
It is less efficient than the transpiler, but is better for debugging.

#### Import and create interpreter instance
```javascript
const Interpreter = require("@jurian.w/bf-js/interpreter");

const interpreter = new Interpreter();
```

#### Build
Before running, the interpreter needs to build the script structure.
You can do this using the `build()` method. It needs your brainfuck code as a string as argument.
The first argument is the brainfuck code. <br> With the optional second argument you can enable console feedback by setting it to `true`. <br>
The function returns `true` if the build was successful, otherwise it returns `false`.
```javascript
const code = ',.+.>+++[->+++[-]<]<';
const success = interpreter.build(code);
```
#### Structure
You can get the structure of the built code using the `getStructure()` method.
It shows the structure of the code in the console. <br>
Optionally you can provide `true` as an argument to get console feedback while building the structure.
```javascript
const success = interpreter.getStructure();
```

Output example:
```Hash
Script structure:
1 | ,
2 | .
3 | +
4 | .
5 | >
6 | +
7 | +
8 | +
9 | Loop:
   1| -
   2| >
   3| +
   4| +
   5| +
   6| Loop:
      1| -
   7| <
10| <
End of script structure.
```

#### LoopLimit
To prevent infinite loops, there is a loop limit. The default is 2000 iterations per loop.
You can change this limit by setting the `loopLimit()` property of the interpreter instance.
It will change the limit for all future runs. <br>
It needs a positive integer as first argument. <br>
Optionally you can provide `true` as a second argument to get console feedback while setting the limit.
```javascript
const success = interpreter.setLoopLimit(250);
```

#### Execute
After building the structure, you can run the code using the `execute()` method.
It needs a string as argument that is a sequence of all input values. Optionally you can provide `true` as a second argument to get console feedback while executing the code. <br>
It returns the output as a string. If there is a critical error, the command that caused the error will be skipped and the execution will continue. <br>

```javascript
const response = interpreter.execute("ABC");
```

#### Execute with feedback log
You can also get a feedback log while executing the code. <br>
It needs the same arguments as the `execute()` method. <br>
It returns an object with three properties:
- `error`: A boolean that indicates if a critical error occurred
- `result`: The output as a string
- `responses`: An array with objects that contains `char` (the output character) and `int` (the ASCII value of the output character)
```javascript
const response = interpreter.executeAndShowFullLog("ABC");
```

Example output:
```Hash
------------------------------------------------
Code progress:
↓
,+.,+.
Next input character:
↓
ABC
Insert input value: "A" → 65
 ↓ Selected
[0]
 ↓ Set to 65
[65]

 Current output:
"" 
------------------------------------------------
Code progress:
 ↓
,+.,+.
Next input character:
 ↓
ABC
Increase Storage value
 ↓ Selected
[65]
 ↓ Added 1
[66]

 Current output:
"" 
------------------------------------------------
Code progress:
  ↓
,+.,+.
Next input character:
 ↓
ABC
Select current char to output: "B" with code 66
 ↓ Selected
[66]
 ↓ Get current value
[66]

 Current output:
"" ← "B" Ascii 66
------------------------------------------------
Code progress:
   ↓
,+.,+.
Next input character:
 ↓
ABC
Insert input value: "B" → 66
 ↓ Selected
[66]
 ↓ Set to 66
[66]

 Current output:
"B" 
------------------------------------------------
Code progress:
    ↓
,+.,+.
Next input character:
  ↓
ABC
Increase Storage value
 ↓ Selected
[66]
 ↓ Added 1
[67]

 Current output:
"B" 
------------------------------------------------
Code progress:
     ↓
,+.,+.
Next input character:
  ↓
ABC
Select current char to output: "C" with code 67
 ↓ Selected
[67]
 ↓ Get current value
[67]

 Current output:
"B" ← "C" Ascii 67
------------------------------------------------
RAM Usage:
rss          39.34 MB
heapTotal    5.09 MB
heapUsed     4.26 MB
external     1.48 MB
arrayBuffers 0.01 MB

Execution completed successfully.
Final output: "BC"
```
#### Execute and replay step by step
You can also run the code, and replay it step by step. <br>
It needs the same arguments as the `execute()` method. <br>
If there is a critical error, the command that caused the error will be skipped and the execution will continue. <br>
It returns an object with three properties:
- `error`: A boolean that indicates if a critical error occurred
- `result`: The output as a string
- `responses`: An array with objects that contains `char` (the output character) and `int` (the ASCII value of the output character)

>Important ! : This function is asynchronous, so you need to use `await` or `.then()` to handle it correctly.

```javascript
const response = await interpreter.executeAndShowStepByStepRePlay("ABC");
```

Example output:
```Hash
RAM Usage:
rss          37.58 MB
heapTotal    4.84 MB
heapUsed     3.53 MB
external     1.20 MB
arrayBuffers 0.01 MB
------------------------------------------------
Code progress:  
↓              
,+.,+.        
Next input character:
↓           
ABC        
Insert input value: "A" → 65
 ↓ Selected
[0]     
 ↓ Set to 65
[65]  
     
 Current output:
"" 
------------------------------------------------
Press enter to show next step
```

