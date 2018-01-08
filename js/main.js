var variables = [];
var variableNameIndex = [];
var currentProgramName = "";
var untilLoopLineNumbers = [];
var untilLoopComparisons = [];
var cycles = 0;
var cycleLimit = 500;

var examples = {
  "Triangle": "//Change this to alter the size of your triangle:\nCreate an Integer, n, with a starting value of 10.\n\nCreate an Integer, i, with a starting value of 0.\nCreate an Integer, j, with a starting value of 0.\nCreate a String, printTriangle, with a starting value of \" \".\n\nUntil i >= (n-1):\n- Increment the value of i.\n- Append the character ' ' to the string stored in printTriangle.\n\nSet variable i to 0.\n\nUntil i >= (n-1):\n- Increment the value of i.\n- Set variable j to j+i.\n- Remove the character at position 1 of the string stored in printTriangle.\n- Append the character '%' to the string stored in printTriangle.\n- Append the character '%' to the string stored in printTriangle.\n- Print the value of printTriangle to the console.\n\nPrint the value of j to the console.\n\n#\nThe output, when n is 10, should look like this:\n(Note that the number of percent signs shown by this program is twice the number shown on the bottom, because I wanted it to be symmetric.)\n\n         %%\n        %%%%\n       %%%%%%\n      %%%%%%%%\n     %%%%%%%%%%\n    %%%%%%%%%%%%\n   %%%%%%%%%%%%%%\n  %%%%%%%%%%%%%%%%\n %%%%%%%%%%%%%%%%%%\n45\n#",
  "Demo-1": "Create an Integer, variable1, with a starting value of 10.\nCreate a Float, variable2, with a starting value of 0.5.\n\nSet variable variable1 to 12*variable1.\nPrint the value of variable1 to the console.\n\nCreate a Boolean, dummy_boolean, with a starting value of True.\nPrint the value of dummy_boolean to the console.\n\nCreate a Float, DUMMY_float, with a starting value of 1.25.\nSet variable DUMMY_float to DUMMY_float + variable1+variable2^2\nPrint the value of DUMMY_float to the console.",
  "Demo-2": "Create an Integer, variable1, with a starting value of 10.\nCreate an Integer, variable2, with a starting value of 0.\n\nPrint the value of variable1 to the console.\nIncrement the value of variable1.\nPrint the value of variable1 to the console.\nIncrement the value of variable2.\nIncrement the value of variable2.\n\nCreate a Float, hello, with a starting value of 0.\nSet variable hello to 1+variable1/variable2.\n\nPrint the value of hello to the console.\n\nDecrement the value of variable2.\nSet variable hello to 1+variable1/variable2.\n\nPrint the value of hello to the console.",
  "HelloWorld": "Create a String, h, with a starting value of \"Hello, World!\".\nAlert the user with the value of h."
}

window.onload = function() {
  var reg = new RegExp( '[?&]example=([^&#]*)', 'i' );
  var string = reg.exec(window.location.href);
  if (string) {
    if (examples[string[1]]) {
      document.getElementById("codeTerminal").innerHTML = examples[string[1]];
    }
  }
  var codeTerminal = document.getElementById("codeTerminal")
  var lineNumbers = document.getElementById("lineNumbers")
  codeTerminal.onkeyup = function(event) {
    var row_number = 0;
    lineNumbers.innerHTML = "";
    codeTerminal.value.split("\n").forEach(function(row) {
      row_number++;
      lineNumbers.innerHTML += row_number + "\n";
    });
    lineNumbers.cols = Math.floor(1 + Math.log10(row_number));
  }

  codeTerminal.onchange = function(event) {
    var row_number = 0;
    lineNumbers.innerHTML = "";
    codeTerminal.value.split("\n").forEach(function(row) {
      row_number++;
      lineNumbers.innerHTML += row_number + "\n";
    });
    lineNumbers.cols = Math.floor(1 + Math.log10(row_number));
  }

  codeTerminal.onkeydown = function(event) {
    var row_number = 0;
    lineNumbers.innerHTML = "";
    codeTerminal.value.split("\n").forEach(function(row) {
      row_number++;
      lineNumbers.innerHTML += row_number + "\n";
    });
    lineNumbers.cols = Math.floor(1 + Math.log10(row_number));
  }

  codeTerminal.onscroll = function(event) {
    lineNumbers.scrollTop = codeTerminal.scrollTop;
  }
}

function Variable(name, type, value) {
  this.name = name;
  this.value = value;
  this.type = type;

  this.validate = function() {
    if (this.type == "integer") {
      this.value = parseInt(this.value);
    } else {
      if (this.type == "float") {
        this.value = parseFloat(this.value);
      } else {
        if (this.type == "string" && typeof this.value != "string") {
          this.value = this.value.toString()
        } else {
          if (this.type == "character" && (typeof this.value != "string" || this.value.length > 1)) {
            this.value = this.value.toString().charAt(0)
          } else {
            if (this.type == "boolean" && typeof this.value != "boolean") {
              this.value = (this.value == true)
            }
          }
        }
      }
    }
  }
  this.init = function() {
    variableNameIndex.push(name);
    this.validate()
    //log(type.charAt(0).toUpperCase() + type.slice(1) + " variable, "+name+', created with value '+value+'.',"MESSAGE");
  }
  this.init()
}

function log(message, hint, documentation, status) {
  documentation = "(documentation hasn't been created yet, so this is an arbitrary dummy link) " + documentation;
  if (status == "ERROR") {
    console.error(message + "\n\nHere's what you can do: \n" + hint + "\n\nHere is a link to the documentation for your problem: \n" + documentation);
  }
  if (status == "WARNING") {
    console.warn(message + "\n\nThis is bad, because \n" + hint + "\n\nHere is a link to the documentation for your problem: \n" + documentation);
  }
  if (hint == "MESSAGE") {
    console.log(message);
  }
}

function interpretCode() {
  variableNameIndex = [];
  variables = [];
  untilLoopLineNumbers = [];
  untilLoopComparisons = [];

  var code = document.getElementById("codeTerminal").value.replace(/\#[^\#]*\#/gm, ""); code = code.split("\n");
  var line_number = 0;
  cycles = 0;
  //console.log(code);
  while ((line_number < code.length) && (cycles < cycleLimit)) {
    cycles++;
    var line = code[line_number].trim();
    line_number++;
    //console.log("=========\nCycle #"+cycles+". Line of code to be executed: "+line+"\n=========");
    if (line.startsWith("- ") || ((line_number - 2 >= 0) ? code[line_number - 2].startsWith("- ") : false)) {
      var index = 0;
      if (line.startsWith("- "))
        index = (line.match(/((?:- )+)/)[0].length/2);
      //console.log("Until loop index #"+index);
      if (untilLoopComparisons.length > index || line_number == code.length) {
        //console.log(untilLoopComparisons[untilLoopComparisons.length - 1] +" evaluates to "+parseExpression(untilLoopComparisons[untilLoopComparisons.length - 1]));
        if (parseExpression(untilLoopComparisons[untilLoopComparisons.length - 1]) === true) {
          untilLoopComparisons.pop();
          untilLoopLineNumbers.pop();
          //console.log("Until loop #"+index+" has finished executing.");
        }
        else {
          index = index == 0 ? 1 : index;
          line_number = untilLoopLineNumbers[untilLoopLineNumbers.length - 1];
          line = code[line_number-1].substring(2*index).trim();
          //console.log("Executing line #"+line_number+": "+line);
        }
      }
      else {
        line = line.substring(2*index).trim();
        //console.log("Executing line #"+line_number+": "+line);
      }
    }
    if (line.startsWith("Create a")) {
      var data = line.substring(9).trim();
      if (data.startsWith("Integer, ")) {
        data = data.substring(9);
        var variable_name = data.match(/([a-zA-Z]\w*)/)[1]
        if (variableNameIndex.indexOf(variable_name) == -1) {
          data = data.substring(variable_name.length + 1).trim()
          if (data.startsWith("with a starting value of ")) {
            data = data.substring(25, data.length - 1)
            variables.push(new Variable(variable_name, "integer", data));
          } else {
            log("Syntax Error on line " + line_number + "!", "Change line " + line_number + ' to be "Create an Integer, ' + variable_name + ', with a starting value of [starting value]." (replace [starting value] with what you want your variable\'s starting value to be.)', "https://google.com", "ERROR");
          }
        }
      }
      if (data.startsWith("Float, ")) {
        data = data.substring(7);
        var variable_name = data.match(/([a-zA-Z]\w*)/)[1]
        if (variableNameIndex.indexOf(variable_name) == -1) {
          data = data.substring(variable_name.length + 1).trim()
          if (data.startsWith("with a starting value of ")) {
            data = data.substring(25, data.length - 1)
            variables.push(new Variable(variable_name, "float", data));
          } else {
            log("Syntax Error on line " + line_number + "!", "Change line " + line_number + ' to be "Create an Float, ' + variable_name + ', with a starting value of [starting value]." (replace [starting value] with what you want your variable\'s starting value to be.)', "https://google.com", "ERROR");
          }
        }
      }
      if (data.startsWith("String, ")) {
        data = data.substring(8);
        var variable_name = data.match(/([a-zA-Z]\w*)/)[1]
        if (variableNameIndex.indexOf(variable_name) == -1) {
          data = data.substring(variable_name.length + 1).trim();
          if (data.startsWith("with a starting value of ")) {
            data = data.match(/"([^"\\]*(?:\\.[^"\\]*)*)"\./)[1];
            variables.push(new Variable(variable_name, "string", data));
          } else {
            log("Syntax Error on line " + line_number + "!", "Change line " + line_number + ' to be \'Create a String, ' + variable_name + ', with a starting value of \"[starting value]\".\' (replace [starting value] with what you want your variable\'s starting value to be.)', "https://google.com", "ERROR");
          }
        }
      }
      if (data.startsWith("Boolean, ")) {
        data = data.substring(9)
        var variable_name = data.match(/([a-zA-Z]\w*)/)[1]
        if (variableNameIndex.indexOf(variable_name) == -1) {
          data = data.substring(variable_name.length + 1).trim();
          if (data.startsWith("with a starting value of ")) {
            if (data.substring(25, data.length - 1) == "True" || data.substring(25, data.length - 1) == "False") {
              variables.push(new Variable(variable_name, "boolean", data.substring(25, data.length - 1) == "True"));
            } else {
              log("Type Error on line " + line_number + "!", '"' + data.substring(25, data.length - 1) + '" is not a valid state for a Boolean, which is either "True" or "False".', "https://cemetech.net", "ERROR");
            }
          } else {
            log("Syntax Error on line " + line_number + "!", "Change line " + line_number + ' to be "Create a Boolean, ' + variable_name + ', with a starting value of [starting value]." (replace [starting value] with what you want your variable\'s starting value to be.)', "https://google.com", "ERROR");
          }
        }
      }
    }
    //unimplemented
    if (line.startsWith("If ")) {
      var data = line.substring(3).trim();
    }
    if (line.startsWith("Increment the value of ")) {
      //console.log("Increment command triggered.");
      var data = line.substring(23).trim();
      var variable_name = data.match(/([a-zA-Z]\w*)/)[1];
      data = data.substring(variable_name.length).trim()
      var index = variableNameIndex.indexOf(variable_name);
      if (index != -1) {
        variables[index].value++
      }
    }
    if (line.startsWith("Decrement the value of ")) {
      var data = line.substring(23).trim();
      var variable_name = data.match(/([a-zA-Z]\w*)/)[1];
      data = data.substring(variable_name.length).trim();
      var index = variableNameIndex.indexOf(variable_name);
      if (index != -1) {
        variables[index].value--;
      }
    }
    if (line.startsWith("Until ")) {
      var data = line.substring(6).trim();
      var expression = data.match(/([^:]*)\:/)[1];
      data = data.substring(expression.length).trim();
      untilLoopComparisons.push(expression);
      untilLoopLineNumbers.push(line_number + 1);
      //console.log("line numbers: "+untilLoopLineNumbers);
      //console.log("comparisons: "+untilLoopComparisons);
    }
    if (line.startsWith("Set variable ")) {
      //console.log("Set command triggered.");
      var data = line.substring(12).trim();
      var variable_name = data.match(/([a-zA-Z]\w*)/g)[0];
      //console.log("Variable: "+variable_name+".");
      data = data.substring(variable_name.length).trim();
      var index = variableNameIndex.indexOf(variable_name);
      if (index != -1) {
        if (data.startsWith("to ")) {
          data = data.substring(3);
          data = data.substring(0, data.length-1);
          variables[index].value = parseExpression(data);
          //console.log(variable_name+" = "+variables[index].value);
          variables[index].validate();
        }
      }
    }
    if (line.startsWith("Print the value of ")) {
      var data = line.substring(19).trim();
      var variable_name = data.match(/([a-zA-Z]\w*)/)[1];
      data = data.substring(variable_name.length).trim();
      var index = variableNameIndex.indexOf(variable_name);
      if (index != -1) {
        if (data == "to the console.") {
          console.log(variables[index].value);
        }
      }
    }
    if (line.startsWith("Alert the user with the value of ")) {
      var data = line.substring(33).trim();
      var variable_name = data.match(/([a-zA-Z]\w*)/)[1];
      data = data.substring(variable_name.length).trim();
      var index = variableNameIndex.indexOf(variable_name);
      if (index != -1) {
        alert(variables[index].value);
      }
    }
    if (line.startsWith("Append the character '")) {
      var data = line.substring(22);
      var character = data.substring(0,1);
      data = data.substring(3).trim();
      if (data.startsWith("to the string stored in")) {
        data = data.substring(23).trim();
        var variable_name = data.match(/([a-zA-Z]\w*)/g)[0];
        var index = variableNameIndex.indexOf(variable_name);
        if (index != -1) {
          if (variables[index].type == "string") {
            variables[index].value += character;
          }
        }
      }
    }
    if (line.startsWith("Remove the character at position ")) {
      var data = line.substring(33);
      var data2 = data.match(/(?:(.*)?(?: of the string stored in)) ([A-Za-z]\w*)/);
      var position = data2[1];
      var variable_name = data2[2];
      var index = variableNameIndex.indexOf(variable_name);
      if (index != -1) {
        if (variables[index].type == "string") {
          position = parseExpression(position);
          variables[index].value = variables[index].value.substring(0, position-1) + variables[index].value.slice(position);
        }
      }
    }
    if (line.startsWith("Prepend the character '")) {
      var data = line.substring(23);
      var character = data.substring(0,1);
      data = data.substring(3).trim();
      if (data.startsWith("to the string stored in")) {
        data = data.substring(23).trim();
        var variable_name = data.match(/([a-zA-Z]\w*)/g)[0];
        var index = variableNameIndex.indexOf(variable_name);
        if (index != -1) {
          if (variables[index].type == "string") {
            variables[index].value = character + variables[index].value;
          }
        }
      }
    }
    if (line.startsWith("//") || line.startsWith("#")) {
      //console.log("Comment Ignored");
    }
  }
  if (cycles >= cycleLimit) {
    console.error("Your operation took too long.")
  }
}

function parseExpression(expression) {
  expression = "("+expression+") + 0";
  var boolean_replace = [
    [" or ", " | "],
    [" and ", " & "],
    [" does not equal ", " ! "],
    [" is not equal to ", " ! "],
    ["<=", "@"],
    [">=", "#"],
    ["!=", "!"]
  ];
  boolean_replace.forEach(function(replace_key) {
    expression = expression.replace(replace_key[0],replace_key[1]);
  });
  //console.log(expression);
  var matches = expression.match(/([a-zA-Z]\w*)/g);
  if (matches) {
    matches.forEach(function(match) {
      var index = variableNameIndex.indexOf(match);
      if (index != -1) {
        expression = expression.replace(match, variables[index].value);
        //console.log(match + " is equal to "+variables[index].value);
      }
    });
  }
  //vv partially my code.
  function toPostFix(expression) {
    var pfixString = "";
    var infixStack = [];
    infixStack[infixStack.length - 1]
    var precedence = function(operator) {
      switch (operator) {
        //case "!":
        //  return 5;
        case "|":
        case "&":
          return 4;
        case "^":
          return 3;
        case "*":
        case "/":
          return 2;
        case "+":
        case "-":
          return 1;
        case "=":
        case ">":
        case "<":
        case "!":
        case "@":
        case "#":
          return 0;
        default:
          return 0;
      }
    }
    var operators = ["+","-","*","/","^","!","=","<",">","@","#","|","&"];
    for (var i = 0; i < expression.length; i++) {
      var c = expression.charAt(i);
      if (!isNaN(parseInt(c)) || c == ".") {
        pfixString += c;
      } else if (operators.indexOf(c) != -1) {
        pfixString += " ";
        while (c != "(" && !(infixStack.length == 0) && (precedence(c) <= precedence(infixStack[infixStack.length - 1]))) {
          pfixString += " " + infixStack.pop() + " ";
        }
        infixStack.push(c);
      }
    }
    while (!(infixStack.length == 0)) {
      pfixString += " " + infixStack.pop() + " ";
    }
    pfixString = pfixString.replace(/ {2}/g, " ");
    pfixString = pfixString.replace(/ {2}/g, " ");

    return pfixString;
  }
  //^^ not my code.
  //vv my code.
  function evaluate(expression) {
    var stack = [];
    var result = 0;
    var expr = expression.split(" ");
    expr.pop()
    index = expr.length;
    expr.forEach(function(token) {
      if (!isNaN(token)) {
        stack.push(token);
      } else {
        var b = stack.pop();
        var a = stack.pop();
        
        switch (token) {
          case "*":
            stack.push(parseFloat(a) * parseFloat(b));
            break;
          case "/":
            stack.push(parseFloat(a) / parseFloat(b));
            break;
          case "-":
            stack.push(parseFloat(a) - parseFloat(b));
            break;
          case "+":
            stack.push(parseFloat(a) + parseFloat(b));
            break;
          case "^":
            stack.push(Math.pow(parseFloat(a), parseFloat(b)));
            break;
          case "!":
            stack.push(a != b);
            break;
          case "&":
            stack.push(a && b);
            break;
          case "=":
            stack.push(a == b);
            break;
          case "|":
            stack.push(a || b);
            break;
          case ">":
            stack.push(parseFloat(a) > parseFloat(b));
            break;
          case "<":
            stack.push(parseFloat(a) < parseFloat(b));
            break;
          case "@":
            stack.push(parseFloat(a) <= parseFloat(b));
            break;
          case "#":
            stack.push(parseFloat(a) >= parseFloat(b));
            break;
          default:
            break;
        }
      }
      //console.log(token);
      //console.log(stack);
    });
    if (stack.length == 1) {
      return stack[0];
    }
  }
  //console.log(toPostFix(expression));
  return evaluate(toPostFix(expression));
}

function save() {
  var name = currentProgramName;
  var invalidNameEntered = true;
  name = prompt("Please enter a name for this program.", name);
  //vv not my code.
  function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
    } else {
      pom.click();
    }
  }
  download(name + ".simple", document.getElementById("codeTerminal").value);
  //^^ not my code
  currentProgramName = name;
  document.getElementsByTagName("h1")[0].innerText = "Editing file: " + currentProgramName;
}

function loadFile(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    currentProgramName = file.name.slice(0, -7);
    document.getElementsByTagName("h1")[0].innerText = "Editing file: " + currentProgramName;
    var output = e.target.result;
    document.getElementById('codeTerminal').value = output;
    document.getElementById('codeTerminal').onkeydown();
  };
  reader.readAsText(file, "UTF-8");
}
