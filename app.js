
// Include express
const express = require ('express');
const app = express ();

const session = require ('express-session');
const bodyParser = require ('body-parser');

const port = 5000;

const MongoClient = require ('mongodb').MongoClient;

// Set the body parser.
app.use (bodyParser.urlencoded ({extended: true}));

// Set the templating.
app.set ('view engine', 'ejs');

app.use (express.static ('public'));

// Setup the session for use by the express.
app.use (session ({
    secret: 'this is my secret code...',     // Used to keep the session hard to hack.
    resave: false,
    saveUninitialized: true
}));

var db;
MongoClient.connect ('mongodb://localhost:27017/rbravo_simple_shop', function (error, database) {
    // Check for error.
    if (error) {
        throw error;
        return;
    }

    // Start the server.
    db = database;

    app.listen (port, function () {
        console.log ('- App started on port ' + port);
    })
});

// Route to home page.
app.get ('/', function (request, response) {
    response.render ('index.ejs');
});

// Handle routes for login.
app.get ('/login', function (request, response) {
    response.render ('login.ejs');
});

app.get ('/error', function (request, response) {
    response.render ('error.ejs');
});


// -----------------------------------------
// Products

// Route for displaying a list of products.
app.get ('/product', function (request, response) {

    // Pull all of the product items from the database.
    db.collection ('products').find ().toArray (function (error, resultList) {
        // Throw error if found.
        if (error) {
            throw error;
            response.redirect ('/error');
        }
        else {
            // Render out the product page.
            // console.log (resultList);

            // This is temporary.
            var item = resultList [0];
            console.log ('item id: ', item._id);


            // Render the page once the query is done.
            response.render ('product-list.ejs',
                {
                    name: 'ron bravo',
                    city: 'phoenix',
                    productList: resultList
                }
            );
        }
    });
});

app.get ('/cart/add/:id', function (request, response) {
    console.log ('Item added by id: ' + request.params.id);

    // console.log ('Item: ', MongoClient.ObjectID);
    var objectId = request.params.id;

    // Run a query to look for the product by id.
    db.collection ('products').findOne (
        // The type of document to search for.
        {
            // _id: MongoClient.ObjectID.createFromHexString (request.params.id)
            name: objectId
        },

        // The fields of the found object to return.
        // An empty JS literal object will return
        // all of the object's fields.
        {},

        // Callback function to run when the query is done.
        function (error, resultList) {

            // Check for errors.
            if (error) {
                throw error;
                response.redirect ('/error');
            }

            // Check if we have a shopping cart in the session.
            var cart = request.session.cart;

            // If no cart exists, create a new cart.
            if (!cart) {
                cart = {
                    itemList: []
                };

                // Save the cart to the session.
                request.session.cart = cart;
            }

            // Grab the item from the result list.
            var item = resultList;

            // Add the product to the cart.
            cart.itemList.push (item);

            // Respond with a simple message.
            console.log ('--------------');
            console.log ('result list: ', resultList);
            console.log ('cart: ', cart);
            console.log ('');

            response.redirect ('/cart');
        }
    );
});


// req.params.?
// req.query.?
