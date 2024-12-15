//Import all node modules
import pg from "pg";
import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";

// Initializing Modules, Port and Database
const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 1000*60*60*24,
      }
    })
  );

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

let message="";
let profileData= {};
let notes=[];
let create="CREATE";

//Handling get requests

app.get("/", (req, res)=>{
    profileData={};
    res.render("home.ejs");
});
 
app.get("/login", (req, res)=>{
    profileData={};
    res.render("login.ejs",{error: message});
    message="";
    create="EDIT";
})

app.get("/register", (req,res)=>{
    profileData={}
    res.render("register.ejs", {error: message})
});


app.get("/create", async(req, res) => {
  if (req.isAuthenticated()) {
    const user_id = req.user.id;
    const result = await db.query("SELECT * FROM profile WHERE id=($1)",[user_id]);
    res.render("create.ejs", {profileData: profileData, create: create});
  } else {
      res.redirect("/login");
  }
});

app.get("/profile", async(req, res) => {
    if (req.isAuthenticated()) {
      const user_id = req.user.id;
      const result = await db.query("SELECT * FROM profile WHERE id=($1)",[user_id]);
      profileData = result.rows[0];
      const result_ = await db.query("SELECT dob FROM profile WHERE id=($1)",[user_id]);
      const d = String(result_.rows[0].dob).slice(4, 15);
      profileData.dob= d;
      const result2 = await db.query("SELECT * FROM notes WHERE user_id=($1)",[user_id]);
      notes = result2.rows;
      res.render("profile.ejs", { profileData: profileData, notes: notes,  });
      create="EDIT";
    } else {
        res.redirect("/login");
    }
  });

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/auth/google",
  passport.authenticate("google", { 
   scope: ["profile", "email"] 
}));

app.get("/auth/google/profile", passport.authenticate("google", {
 successRedirect: "/profile",
 failureRedirect: "/login",
}));
  
//Handling post requests

app.post("/submit", async(req, res) => {
    if (req.isAuthenticated()) {
      const user_id = req.user.id;
      await db.query("UPDATE profile SET fname=($1), lname=($2), dob=($3), number=($4), details=($5) WHERE id =($6)",[req.body.firstName, req.body.lastName, req.body.dob, req.body.mobileNumber, req.body.educationDetails, user_id]);
      const result = await db.query("SELECT * FROM profile WHERE id=($1)",[user_id]);
      
      profileData = result.rows[0];
      res.redirect("/profile"); 
    } else {
        res.redirect("/login");
    }
  });


app.post("/login", passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
  })
);

app.post("/register", async(req, res) => {
    const user_email = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    try{
        const checkUsername = await db.query("SELECT * FROM profile WHERE email=($1)",[user_email]);
        if(checkUsername.rows.length>0){
            message= "Already an account associated with this email. Please login here";
            res.redirect("/login");
        } else {
            if (password !== password2) {
                message= "Passwords do not match. Please try again.";
                res.redirect("/register");
            }
            else{
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) console.error("Error hashing password: ", err);
                else {
                    const result = await db.query("INSERT INTO profile (email, password) VALUES ($1, $2) RETURNING *", [user_email, hash]);
                    const user = result.rows[0];
                    req.login(user, (err) => {
                        res.redirect("/create");
                    });
                }
            });
        }};
    }catch(err){
        console.log(err);
    };
});

app.post("/addnote", async(req, res) => {
  if (req.isAuthenticated()) {
    const user_id = req.user.id;
    await db.query("INSERT INTO notes (user_id, title, note) VALUES ($1, $2, $3)",[user_id, req.body.noteTitle, req.body.newNote]);
    const result = await db.query("SELECT * FROM notes WHERE user_id=($1)",[user_id]);
    notes = result.rows;
    console.log(notes);
    res.redirect("/profile");
  } else {
      res.redirect("/login");
  }

});

app.post("/deleteNote", async(req, res) => {
  if (req.isAuthenticated()) {
    const user_id = req.user.id;
    const noteId = req.body.noteId;

    // Delete the note from the database
    await db.query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [noteId, user_id]);
    const result = await db.query("SELECT * FROM notes WHERE user_id=($1)",[user_id]);
    notes = result.rows;
    console.log(notes);
    // Redirect to the profile page after deletion
    res.redirect("/profile");
  } else {
    res.redirect("/login");
  }
});



//Setting up passport strategy for local authentication

passport.use(
    "local",
    new Strategy(async function verify(username, password, cb) {
      try {
        const result = await db.query("SELECT * FROM profile WHERE email = $1 ", [
        username,
        ]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          const storedHashedPassword = user.password;
          bcrypt.compare(password, storedHashedPassword, (err, valid) => {
            if (err) {
              console.error("Error comparing passwords:", err);
              return cb(err);
            } else {
              if (valid) {
                return cb(null, user);
              } else {
                message= "Incorrect email or password. Please try again.";
                return cb(null, false);
              }
            }
          });
        } else {
            message = "Incorrect email or password. Please try again.";
            return cb(null, false);
        }
      } catch (err) {
        console.log(err);
      }
    })
  );
  
// Setting up passport strategy for google authentication

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID ,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ,
      callbackURL: "http://scriptsafe.onrender.com/auth/google/profile",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async(accessToken, refreshToken, profile, cb)=>{
      try{
        const result = await db.query("SELECT * FROM profile WHERE email = ($1)", [profile.email]);
        if (result.rows.length===0){
          const newUser = await db.query("INSERT INTO profile (email, password, fname, lname) VALUES ($1, $2, $3, $4) RETURNING *", [profile.email, "googlelogin",  profile.given_name, profile.family_name]);
          return cb(null, newUser.rows[0]);
        }else{
          return cb(null, result.rows[0]);
        }
      }catch(err){
          return cb(err);
      }
    }
  )
);

// Serializing and deserializing User

passport.serializeUser((user, cb) => {
    cb(null, user.id); 
});
  
passport.deserializeUser(async (id, cb) => {
    try {
        const result = await db.query("SELECT * FROM profile WHERE id = $1", [id]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            cb(null, user);
        } else {
            cb(new Error('User not found'));
        }
    } catch (err) {
        cb(err);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });