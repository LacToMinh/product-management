const express = require("express");
var path = require("path");
const methodOverride = require("method-override"); // Import method-override
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
require("dotenv").config();

const database = require("./config/database.js");

const systemConfig = require("./config/system.js");

const routesAdmin = require("./routes/admin/index.route.js");
const routesClient = require("./routes/client/index.route.js");

database.connect();

const app = express();
const port = process.env.PORT;

app.use(methodOverride("_method"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

// Flash
app.use(cookieParser("lactominhdeptrai"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());
// End Flash

// TinyMCE
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce"))
);
// End TinyMCE

// App Locals Variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;

app.use(express.static(`${__dirname}/public`));

// Routes
routesClient(app);
routesAdmin(app);

app.listen(port, () => {
  console.log(`Success, Server is running at http://localhost:${port}`);
});
