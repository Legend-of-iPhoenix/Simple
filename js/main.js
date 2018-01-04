var variables = [];
var variableNameIndex = [];
var currentProgramName = "";
var untilLoopVariables = [];
var untilLoopConstants = [];
var untilLoopComparisons = [];

window.onload = function() {
	var codeTerminal = document.getElementById("codeTerminal")
	var lineNumbers = document.getElementById("lineNumbers")
	codeTerminal.onkeyup = function(event) {
		var row_number = 0;
		lineNumbers.innerHTML = "";
		codeTerminal.value.split("\n").forEach(function(row) {
			row_number++;
			lineNumbers.innerHTML += row_number + "\n";
		});
		lineNumbers.cols = Math.floor(1+Math.log10(row_number));
	}

	codeTerminal.onchange = function(event) {
		var row_number = 0;
		lineNumbers.innerHTML = "";
		codeTerminal.value.split("\n").forEach(function(row) {
			row_number++;
			lineNumbers.innerHTML += row_number + "\n";
		});
		lineNumbers.cols = Math.floor(1+Math.log10(row_number));
	}

	 codeTerminal.onkeydown = function(event) {
		var row_number = 0;
		lineNumbers.innerHTML = "";
		codeTerminal.value.split("\n").forEach(function(row) {
			row_number++;
			lineNumbers.innerHTML += row_number + "\n";
		});
		lineNumbers.cols = Math.floor(1+Math.log10(row_number));
	}

	codeTerminal.onscroll = function(event) {
		lineNumbers.scrollTop = codeTerminal.scrollTop;
	}

	var codeTerminalButton = document.createElement("button");
	codeTerminalButton.setAttribute("onclick","interpretCode()");

	document.getElementsByTagName("BODY")[0].appendChild(codeTerminalButton);
}

function Variable(name, type, value) {
	this.name = name;
	this.value = value;
	this.type = type;

	this.validate = function() {
		if (this.type == "integer") {
			this.value = parseInt(this.value);
		}
		else {
			if (this.type == "float") {
				this.value = parseFloat(this.value);
			}
			else {
				if (this.type == "string" && typeof this.value != "string") {
					this.value = this.value.toString()
				}
				else {
					if (this.type == "character" && (typeof this.value != "string" || this.value.length > 1)) {
						this.value = this.value.toString().charAt(0)
					}
					else {
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
		console.error(message + "\n\nHere's what you can do: \n" + hint + "\n\nHere is a link to the documentation for your problem: \n"+documentation);
	}
	if (status == "WARNING") {
		console.warn(message + "\n\nThis is bad, because \n" + hint + "\n\nHere is a link to the documentation for your problem: \n"+documentation);
	}
	if (hint == "MESSAGE") {
		console.log(message);
	}
}

function interpretCode() {
	variableNameIndex = [];
	variables = [];
	var code = document.getElementById("codeTerminal").value.split("\n")
	function throwSyntax(line, variableType) {
		log("Syntax Error on line " + line + "!", "Change line " + line + ' to be "Create ' + ("aeiou".indexOf(variableType.toLowerCase().substring(0,1)) ? "an" : "a") + " " + variableType + ", [variable name], with a starting value of [starting value]. (replace [variable name] with the name you want your variable to be, and [starting value] to what you want your variable's starting value to be.)","https://google.com","ERROR");
	}
	line_number = 0;
	code.forEach(function(line) {
		line_number++
		line = line.trim();
		if (line.startsWith("Create a")) {
			var data = line.substring(9).trim();
			if (data.startsWith("Integer, ")) {
				data = data.substring(9)
				var variable_name = data.match(/([a-zA-Z]\w*)/)[1]
				if (variableNameIndex.indexOf(variable_name) == -1) {
					data = data.substring(variable_name.length + 1).trim()
					if (data.startsWith("with a starting value of ")) {
						data = data.substring(25, data.length - 1)
						variables.push(new Variable(variable_name, "integer", data));
					}
					else {
						log("Syntax Error on line " + line_number + "!", "Change line " + line_number + ' to be "Create an Integer, '+variable_name+', with a starting value of [starting value]." (replace [starting value] with what you want your variable\'s starting value to be.)',"https://google.com","ERROR");
					}
				}
			}
			if (line.startsWith("Create a")) {
				var data = line.substring(9).trim();
				if (data.startsWith("Float, ")) {
					data = data.substring(7);
					var variable_name = data.match(/([a-zA-Z]\w*)/)[1]
					if (variableNameIndex.indexOf(variable_name) == -1) {
						data = data.substring(variable_name.length + 1).trim()
						if (data.startsWith("with a starting value of ")) {
							data = data.substring(25, data.length - 1)
							variables.push(new Variable(variable_name, "float", data));
						}
						else {
							log("Syntax Error on line " + line_number + "!", "Change line " + line_number + ' to be "Create an Float, '+variable_name+', with a starting value of [starting value]." (replace [starting value] with what you want your variable\'s starting value to be.)',"https://google.com","ERROR");
						}
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
						}
						else
						{
							log("Type Error on line " + line_number + "!", '"'+data.substring(25, data.length - 1) + '" is not a valid state for a Boolean, which is either "True" or "False".',"https://cemetech.net","ERROR");
						}
					}
					else {
						log("Syntax Error on line " + line_number + "!", "Change line " + line_number + ' to be "Create a Boolean, '+variable_name+', with a starting value of [starting value]." (replace [starting value] with what you want your variable\'s starting value to be.)',"https://google.com","ERROR");
					}
				}
			}
		}
		//unimplemented
		if (line.startsWith("If ")) {
			var data = line.substring(3).trim();
		}
		if (line.startsWith("Increment the value of ")) {
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
				variables[index].value--
			}
		}
		//unimplemented
		if (line.startsWith("Until the value of ")) {
			var data = line.substring(19).trim();
			var variable_name = data.match(/([a-zA-Z]\w*)/)[1];
			data = data.substring(variable_name.length).trim()
			var index = variableNameIndex.indexOf(variable_name);
			if (index != -1) {
				untilLoopVariables.push(variables[index]);
				if (data.startsWith("is equal to")) {

				}
			}

		}
		if (line.startsWith("Set variable ")) {
			var data = line.substring(12).trim();
			var variable_name = data.match(/([a-zA-Z]\w*)/)[1];
			data = data.substring(variable_name.length).trim()
			var index = variableNameIndex.indexOf(variable_name);
			if (index != -1) {
				if (data.startsWith("to ")) {
					data = data.substring(3);
					variables[index].value = parseExpression(data);
					variables[index].validate();
				}
			}
		}
		if (line.startsWith("Print the value of ")) {
			var data = line.substring(19).trim();
			var variable_name = data.match(/([a-zA-Z]\w*)/)[1];
			data = data.substring(variable_name.length).trim()
			var index = variableNameIndex.indexOf(variable_name);
			if (index!=-1) {
				if (data == "to the console.") {
					console.log(variables[index].value);
				}
			}
		}
	});
}

function parseExpression(expression) {
	/*var boolean_replace = [
		[" is equal to ", "=="],
		[" is not equal to ", "!="],
		[" is greater than or equal to ", ">="],
		[" is less than or equal to ", "<="],
		[" is greater than ", ">"],
		[" is less than ", "<"]
	]
	boolean_replace.forEach(function(replace_key) {
		expression = expression.replace(replace_key[0],replace_key[1]);
	});*/

	var matches = expression.match(/([a-zA-Z]\w*)/g);
	matches.forEach(function(match) {
		var index = variableNameIndex.indexOf(match);
		if (index != -1) {
			expression = expression.replace(match, variables[index].value);
		}
	});
	//vv not my code.
  function toPostFix(expression) {
    var pfixString = "";
    var infixStack = [];
    infixStack[infixStack.length - 1]
    var precedence = function(operator) {
      switch (operator) {
        case "^":
          return 3;
        case "*":
        case "/":
          return 2;
        case "+":
        case "-":
          return 1;
        default:
          return 0;
      }
    }
    for (var i = 0; i < expression.length; i++) {
      var c = expression.charAt(i);
      if (!isNaN(parseInt(c))||c==".") {
        pfixString += c;
      } else if (c === "+" || c === "-" || c === "*" || c === "/" || c === "^") {
      	pfixString += " ";
        while (c != "^" && !(infixStack.length == 0) && (precedence(c) <= precedence(infixStack[infixStack.length - 1]))) {
          pfixString += " " + infixStack.pop() + " ";
        }
        infixStack.push(c);
      }
    }
    while (!(infixStack.length == 0)) {
      pfixString += " " + infixStack.pop() + " ";
    }
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
  		}
  		else {
  			var b = parseFloat(stack.pop());
  			var a = parseFloat(stack.pop());
  			switch (token) {
  				case "*":
  					stack.push(a * b);
  					break;
  				case "/":
  					stack.push(a / b);
  					break;
  				case "-":
  					stack.push(a - b);
  					break;
  				case "+":
  					stack.push(a + b);
  					break;
  				case "^":
  					stack.push(Math.pow(a, b));
  					break;
  				default:
  					break;
  			}
  		}
  	});
  	if (stack.length == 1) {
  		return stack[0];
  	}
  }
 	return evaluate(toPostFix(expression));
}

function save() {
	var name = currentProgramName;
	var invalidNameEntered = true;
	while (invalidNameEntered) {
		name = prompt("Please enter a name for this program. \n\nAlphanumeric only.",name);
		invalidNameEntered = !/[0-9a-zA-Z]*/.test(name) || !name;
	}
	//vv not my code.
	function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
	}
	download(name+".simple",document.getElementById("codeTerminal").value);
	//^^ not my code
	currentProgramName = name;
	document.getElementsByTagName("h1")[0].innerText = "Editing file: "+currentProgramName;
}


function loadFile(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
  	currentProgramName = file.name.slice(0,-7);
  	document.getElementsByTagName("h1")[0].innerText = "Editing file: "+currentProgramName;
    var output = e.target.result;
    document.getElementById('codeTerminal').value = output;
    document.getElementById('codeTerminal').onkeydown();
  };
  reader.readAsText(file, "UTF-8");
}