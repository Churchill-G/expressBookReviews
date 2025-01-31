const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

// Middleware for customer authentication
app.use("/customer/auth/*", function auth(req,res,next){
    //Write the authenication mechanism here
    // Check if user is authenticated
   if (req.session.authorization) {
    let token = req.session.authorization['accessToken']; // Access Token
    
    // Verify JWT token for user authentication
    jwt.verify(token, "access", (err, customer) => {
        if (!err) {
            req.customer = customer; // Set authenticated user data on the request object
            next(); // Proceed to the next middleware
        } else {
            return res.status(403).json({ message: "Customer not authenticated" }); // Return error if token verification fails
        }
    });
    
    // Return error if no access token is found in the session
} else {
    return res.status(403).json({ message: "Customer not logged in" });
}
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Login endpoint - added by me
app.post("/login", (req, res) => {
    const customer = req.body.customer;
    if (!customer) {
        return res.status(404).json({ message: "Body Empty" });
    }
    // Generate JWT access token
    let accessToken = jwt.sign({
        data: customer
    }, 'access', { expiresIn: 60 * 60 });

    // Store access token in session
    req.session.authorization = {
        accessToken
    }
    return res.status(200).send("Customer successfully logged in");
});

app.listen(PORT,()=>console.log("Server is running"));
