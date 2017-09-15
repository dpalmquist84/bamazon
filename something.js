var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'bamazon_DB'
})

connection.connect(function (error) {
    console.log("Connected as id: " + connection.threadId);
})

// goes into DataBases selects all products stringifys them and prints to console
function listStock() {
    connection.query("SELECT * FROM products", function (error, response) {
        console.log(JSON.stringify(response, null, '\t'));
        console.log(response[0].item_id)
    })
    start();
}

function start() {
    connection.query("SELECT * FROM products", function (error, response) {
        inquirer.prompt({
            name: "selectItem",
            type: "rawlist",
            choices: function (value) {
                var itemIDArray = [];
                for (var i = 0; i < response.length; i++) {
                    //had to conver int to string for prompt to work
                    var idItem = response[i].item_id
                    itemIDArray.push(idItem.toString());
                    debugger;
                }
                return itemIDArray;
                

            },
            
            message: "Please select the item id of the item that you would like to purchase",
            
        }).then(function(answer) {
            for (var i = 0; i < response.length; i++) {
                debugger;
                if (response[i].item_id == answer.choice) {
                    var chosenItem = response[i];
                    inquirer.prompt({
                        name: "quantity",
                        type: "input",
                        message: "How many would you like to purchase?",
                        validate: function (value) {
                            if (isNaN(value) == false) {
                                debugger;
                                return true;
                            } else {
                                debugger;
                                return false;
                            }
                        }
                    }).then(function(answer) {
                        debugger;
                        if (chosenItem.stock_quantity > parseInt(answer.quantity)) {
                            debugger;
                            connection.query("UPDATE products SET ? WHERE ?", [{
                                stock_quantity: (parseInt(chosenItem.stock_quantity) -
                                    parseInt(answer.quantity))
                            }, {
                                item_id: chosenItem.stock_quantity
                            }], function (err, response) {
                                console.log("Your order has been placed")
                                debugger;
                                listStock();
                            });
                        } else {
                            debugger;
                            console.log("You placed an order for more than we have in stock try again")
                            listStock();
                        }
                    })
                }

            }
        })
    })
}

listStock();
connection.end();