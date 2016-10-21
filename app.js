
// Include express
const express = require ('express');
const app = express ();

const session = require ('express-session');
const bodyParser = require ('body-parser');

const port = 5000;

const mongoDb = require ('mongodb');
const ObjectId = mongoDb.ObjectID;
const MongoClient = mongoDb.MongoClient;

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


    // console.log ('Item: ', MongoClient);
    // console.log ('Item: ', new ObjectId (request.params.id));
    // var objectId = request.params.id;

    // Run a query to look for the product by id.
    db.collection ('products').findOne (

        // The type of document to search for.
        {
            _id: new ObjectId (request.params.id)
            // name: objectId
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
                    total: 0,
                    itemList: []
                };

                // Save the cart to the session.
                request.session.cart = cart;
            }

            // Grab the item from the result list.
            var item = resultList;

            // Add to the cart quantity.
            cart.total = cart.total + item.price;

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

// Remove an indvidual item from the cart.
app.get ('/cart/remove/:index', function (request, response) {
    console.log ('remove item by index: ', request.params.index);

    var cart = request.session.cart;

    var price = cart.itemList [0].price;
    cart.total = cart.total - price;

    // console.log ('- Testing..................', cart.total);
    // console.log ('- Testing..................', price);
    // console.log ('- Testing..................', cart.total);

    // Redirect to the cart.
    response.redirect ('/cart');
});

app.get ('/cart', function (request, response) {
    // Grab the shopping cart.
    var cart = request.session.cart;

    // Create the cart if none exists.
    if (!cart) {
        cart = {
            total: 0,
            itemList: []
        }

        // Save the cart to session.
        request.session.cart = cart;
    }

    // Render the cart page.
    // response.render ('cart.ejs', {cart: cart});

    // var sendEmail = require (__dirname + '/send-email.js');

    // Send an email.
    sendEmail (
        {
            to: ['ronbravo1701@gmail.com'],
            subject: 'Test Email',
            content: 'Thanks for opening this email!'
        },
        function () {
            // Render the cart page.
            response.render ('cart.ejs', {cart: cart});
        }
    );
});


// req.params.?
// req.query.?

function sendEmail (email, callback) {
    var item, key, list;
    var emailToList = [];

    // Get the recipients list.
    list = email.to;
    for (key in list) {
        item = list [key];
        emailToList.push ({
            email: item
        });
    }
    // Pull in the http request object used to make
    // an HTTP request from our web server to another web server.
    var request = require ('request');

    // Send a POST request to the sendgrid email service.
    console.log ('- Sending email to: ', emailToList);
    request.post (
        {
            // The api call to post the request to.
            url: 'https://api.sendgrid.com/v3/mail/send',

            // The headers to send with the request.
            headers: {
                'Authorization': 'Bearer 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'
            },

            // The JSON / form data to send with the request.
            json: {
                // The email subject and recipients.
                personalizations: [
                    {
                        to: emailToList,
                        subject: email.subject
                    }
                ],

                // From address.
                from: {
                    email: "no-reply@mydomain.com"
                },

                // The content to send in the body of the email.
                content: [
                    {
                        type: "text/html",
                        value: email.content
                    }
                ]
            },
        },

        // The callback function to run when the email
        // is sent.
        function (error, httpResponse) {
            console.log ('- Email sent');
            if (error) {
                throw error;
            }

            if (callback) {
                callback.apply ();
            }
        }
    );
}
