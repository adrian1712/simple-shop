
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
MongoClient.connect ('mongodb://localhost:27017/simple_shop', function (error, database) {
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
