var item, key, list;

function print (itemList) {
    console.log ('-----------');
    list = itemList;
    for (key in list) {
        item = list [key];
        console.log ('\t- item: ', item);
    }

    console.log ('');
}

var cart = {
    total: 0,
    itemList: [
        {
            // "_id" : ObjectId("580903bd125ac8bd614672f5"),
            "name" : "computer",
            "description" : "Create software with it.",
            "price" : 2000.0
        },
        {
            // "_id" : ObjectId("580903bd125ac8bd614672f6"),
            "name" : "phone",
            "description" : "Used to make calls.",
            "price" : 200.0
        }
    ]
}

print (cart);

// Inside the route
var total = cart.total;

list = cart.itemList;
for (key in list) {
    item = list [key];

    total = total + item.price;
}

console.log ('total: ', total);















//
// var productList = [
//     '0 computer',
//     '1 phone',
//     '2 phone',
//     '3 soda',
//     '4 pen',
//     '5 bicycle'
// ];
//
// print ();
//
// var removedItems = productList.splice (2, 1);
// console.log ('removed items: ', removedItems);
//
// print ();
