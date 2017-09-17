
var inquirer = require('inquirer');
var mysql = require("mysql");
var jsonfile = require('jsonfile');
var file = 'data.json';
var colors = require('colors');


var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'P1rates1',
    database: 'bamazon_db'
});


connection.connect(function(error) {
    if (error) throw error;
    console.log(colors.green(`connected as ${connection.threadId}`));
    start();
    });



    function start() {
        inquirer
          .prompt({
            name: "postOrBid",
            type: "list",
            message: "Are you a [CUSTOMER] or [MANAGER]?",
            choices: ["CUSTOMER", "MANAGER"]
          })
          .then(function(answer) {
            // based on their answer, either call the bid or the post functions
            if (answer.postOrBid.toUpperCase() === "MANAGER") {
              manager();
            }
            else {
              customer();
            }
          });
      }

//Customer interface 
//-----------------------------------------------------------------------------------------------------------------------------
function customer() {
    

    // query the database for all items being auctioned
    connection.query("SELECT * FROM products", function(err, results) {
      if (err) throw err;
      // once you have the items, prompt the user for which they'd like to bid on
    
      inquirer
        .prompt([
          {
            name: "choice",
            type: "list",
            choices: function() {
              var choiceArray = [];
              for (var i = 0; i < results.length; i++) {
                choiceArray.push(results[i].product_name);
              }
              return choiceArray;
          },
          message: "What product do you want to purchase"
        }
     ]).then(function(answer){
         var chosenItem;
         
         product = answer.choice;
         
         
        numProducts()
         })
        });
    }

function numProducts() {
    console.log(colors.bold(`You have chosen ${product}`))
    inquirer
     .prompt({
         type: "input",
         name: "quantity",
         message: "how many do you want to buy?"
     }).then(function(response){
         number = response.quantity;
         
         connection.query("SELECT stock_quantity FROM products WHERE ?",
        {
            product_name: product

        }, function(err, res){
            
            stock = res[0].stock_quantity;
            if (number <= stock) {
                console.log(colors.yellow(`you have selected to buy ${number} ${product}`))
                updatedQuantity = stock - number;
              
                setTimeout(order, 3000);

            } else if (number > stock) {
            console.log(colors.italic.bold.red(`there are only ${stock} available 😦`))
            console.log(colors.bold.bgBlue.white(`returning to the store`))
            setTimeout(start, 3000);
            }
        }
    )
         
        
     })
}

function order(){
    connection.query("SELECT price FROM products where ? ",
     
         {
             product_name: product
         },
     function(error, answers) {
         
         
         orderPrice = answers[0].price;
         totalPrice = orderPrice * number;
         console.log(`they are 💲 ${orderPrice} each
Your total price is 💲 ${totalPrice}`)
         setTimeout(updateStock, 3000);
     });
};

function updateStock(){
    
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
        {
            stock_quantity: updatedQuantity
        },{
            product_name: product
        },
    ],
        function(error) {
            if (error) throw error;
            console.log(colors.bgWhite.black(`available stock is now ${updatedQuantity}`));
            setTimeout(updateDB, 3000);
        }
    )
}

function updateDB(){
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
    console.log(results)
    start();
})
};
//manager interface
//-------------------------------------------------------------------------------------------
function manager() {
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
    });
    
    console.log(`the password is:`);
    console.log(colors.bold.red(`password`));

    inquirer
      .prompt([
          { 
              name: "myPassword",
              type: "password",
              message: "what is your password"
        }
      ]).then(function(user){
       
          
          if (user.myPassword === "password"){
              console.log(`password works`)
              managerMenu()
          } else {
              console.log(`access denied`)
          }
      })
    };

function managerMenu() {
    var answer = "";
    
        inquirer
          .prompt([
              {
            name: "managerMenu",
            type: "list",
            message: "What do you want to do?",
            choices: ["View products", "View low inventory", "Add to inventory", "Add a new product", "Go back to the main menu"]
          }
        ]).then(function(answer) {
            // based on their answer, either call the bid or the post functions
            console.log(answer.managerMenu)
         switch(answer.managerMenu) {
             case "View products":
                products();
                break;
             case "View low inventory":
                inventory();
                break;
             case "Add to inventory":
                addInventory();
                break;
             case "Add a new product":
                newProduct();
                break;
             case "Go back to the main menu":
                start();
                break;
             default:
                start();
         }
      });
}

function products() {
 //view all products
 connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    var choiceArray = [];
    for (var i = 0; i < results.length; i++) {
      choiceArray.push(results[i].product_name);
    }
    console.log(choiceArray)
    return choiceArray;
 });

 setTimeout(managerMenu, 5000)
}
//function the view low inventory
function inventory() {  
    var query = "SELECT product_name FROM products WHERE stock_quantity < 10";
    connection.query(query, function(err, res) {
        console.log(`Less than 10 left.  Buy Now ⏱ TIME IS RUNNING OUT`)
        if (err) throw (err);
      for (var i = 0; i < res.length; i++) {
        console.log(res[i].product_name);
      }
     setTimeout(managerMenu, 5000)
    });
  }

function newProduct() {
    
    console.log("Inserting a new product...\n");
    inquirer
        .prompt([
            {
                type: "input",
                name: "product",
                message: "what product do you want to add"
            }, {
                type: "input",
                name: "department",
                message: "What deparment does this product belong in"
            }, {
                type: "input",
                name: "price",
                message: "How much does it cost"
            }, {
                type: "input",
                name: "stock",
                message: "How many do you want to put on the selves"
            },
        ]).then(function(answer){
    var query = connection.query(
      "INSERT INTO products SET ?",
      {
        product_name: answer.product,
        department_name: answer.department,
        price: answer.price,
        stock_quantity: answer.stock
      },
      function(err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " product inserted!\n");
        // Call updateProduct AFTER the INSERT completes
        setTimeout(managerMenu, 5000);
      });
    });
}

function addInventory() {
    console.log("Updating inventory...\n");
    inquirer
    .prompt([
        {
            type: "input",
            name: "product",
            message: "what product do you want to add more inventory too"
        }, {
            type: "input",
            name: "inventory",
            message: "how much to add?"
        },
    ]).then(function(answer){
    var query = connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {
          stock_quantity: answer.inventory
        },
        {
          product_name: answer.product
        }
      ],
      function(err, res) {
        console.log(`${answer.inventory} added to ${answer.product}™ `);
        // Call deleteProduct AFTER the UPDATE completes
        setTimeout(managerMenu, 5000);
      }
    );
    });
}


  
 