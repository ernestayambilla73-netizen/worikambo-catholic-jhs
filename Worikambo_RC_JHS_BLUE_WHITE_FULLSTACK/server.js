const express = require("express");
const path = require("path");
const os = require("os");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const isVercel = process.env.VERCEL === "1";
const dataDir = isVercel ? path.join(os.tmpdir(), "worikambo-data") : path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new sqlite3.Database(path.join(dataDir, "worikambo.db"));

app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  store: isVercel ? undefined : new SQLiteStore({ db: "sessions.sqlite", dir: dataDir }),
  secret: process.env.SESSION_SECRET || "change-this-in-production",
  resave:false,
  saveUninitialized:false,
  cookie:{httpOnly:true,sameSite:"lax",secure:isVercel,maxAge:1000*60*60*8}
}));

function run(sql, params=[]){return new Promise((resolve,reject)=>db.run(sql,params,function(e){e?reject(e):resolve(this)}) )}
function get(sql,params=[]){return new Promise((resolve,reject)=>db.get(sql,params,(e,row)=>e?reject(e):resolve(row)))}
function all(sql,params=[]){return new Promise((resolve,reject)=>db.all(sql,params,(e,rows)=>e?reject(e):resolve(rows)))}

async function init(){
 await run(`CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT UNIQUE, full_name TEXT NOT NULL,
  email TEXT, password_hash TEXT NOT NULL, admission_year INTEGER, graduation_year INTEGER,
  account_status TEXT DEFAULT 'active_student', role TEXT DEFAULT 'student', created_at TEXT DEFAULT CURRENT_TIMESTAMP
 )`);
 await run(`CREATE TABLE IF NOT EXISTS results(
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, academic_year TEXT, subject TEXT, score REAL, grade TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
 )`);
 await run(`CREATE TABLE IF NOT EXISTS resources(
  id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, description TEXT, url TEXT, access_level TEXT DEFAULT 'student'
 )`);
 await run(`CREATE TABLE IF NOT EXISTS hall_of_fame(
  id INTEGER PRIMARY KEY AUTOINCREMENT, student_name TEXT, graduation_year INTEGER, achievement TEXT, score TEXT, verified_by TEXT
 )`);
 await run(`CREATE TABLE IF NOT EXISTS leaders(
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, title TEXT NOT NULL, years_served TEXT, achievements TEXT, photo_url TEXT
 )`);
 await run(`CREATE TABLE IF NOT EXISTS news(
  id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, type TEXT, content TEXT, event_date TEXT
 )`);

 const admin=await get("SELECT id FROM users WHERE student_id=?",["ADMIN-001"]);
 if(!admin){
   await run("INSERT INTO users(student_id,full_name,email,password_hash,role,account_status) VALUES(?,?,?,?,?,?)",
    ["ADMIN-001","School Administrator","admin@worikambo.local",await bcrypt.hash("Admin@123",10),"admin","active_student"]);
 }
 const student=await get("SELECT id FROM users WHERE student_id=?",["WRJHS-2026-001"]);
 if(!student){
   const r=await run("INSERT INTO users(student_id,full_name,email,password_hash,admission_year,account_status,role) VALUES(?,?,?,?,?,?,?)",
    ["WRJHS-2026-001","Demo Student","student@worikambo.local",await bcrypt.hash("Student@123",10),2026,"active_student","student"]);
   await run("INSERT INTO results(user_id,academic_year,subject,score,grade) VALUES(?,?,?,?,?)",
    [r.lastID,"2026","Mathematics",88,"A"]);
 }
}

function auth(req,res,next){if(req.session.user)return next();res.status(401).json({error:"Authentication required"})}
function adminOnly(req,res,next){if(req.session.user?.role==="admin")return next();res.status(403).json({error:"Admin access required"})}

app.post("/api/auth/login",async(req,res)=>{
 try{
  const {student_id,password}=req.body;
  const u=await get("SELECT * FROM users WHERE student_id=?",[student_id]);
  if(!u || !(await bcrypt.compare(password,u.password_hash))) return res.status(401).json({error:"Invalid Student ID or password"});
  req.session.user={id:u.id,student_id:u.student_id,full_name:u.full_name,role:u.role,account_status:u.account_status};
  res.json({user:req.session.user});
 }catch(e){console.error(e);res.status(500).json({error:"Server error"})}
});
app.post("/api/auth/logout",(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get("/api/auth/me",(req,res)=>res.json({user:req.session.user||null}));

app.get("/api/dashboard",auth,async(req,res)=>{
 const u=await get("SELECT id,student_id,full_name,email,admission_year,graduation_year,account_status,role FROM users WHERE id=?",[req.session.user.id]);
 const results=await all("SELECT academic_year,subject,score,grade FROM results WHERE user_id=? ORDER BY academic_year DESC",[u.id]);
 const resources=await all("SELECT id,title,category,description,url,access_level FROM resources WHERE access_level IN ('student','public') OR ?='admin' ORDER BY id DESC",[u.role]);
 res.json({user:u,results,resources});
});

app.post("/api/users",adminOnly,async(req,res)=>{
 const {student_id,full_name,email,password,admission_year,role="student"}=req.body;
 if(!student_id||!full_name||!password)return res.status(400).json({error:"Required fields missing"});
 try{
  const r=await run("INSERT INTO users(student_id,full_name,email,password_hash,admission_year,role) VALUES(?,?,?,?,?,?)",
   [student_id,full_name,email||"",await bcrypt.hash(password,10),admission_year||null,role]);
  res.json({id:r.lastID});
 }catch(e){res.status(400).json({error:"Student ID may already exist"})}
});

app.get("/api/admin/users",adminOnly,async(req,res)=>res.json(await all("SELECT id,student_id,full_name,email,admission_year,graduation_year,account_status,role FROM users ORDER BY id DESC")));
app.put("/api/admin/users/:id/graduate",adminOnly,async(req,res)=>{
 await run("UPDATE users SET graduation_year=?,account_status='old_student',role='alumni' WHERE id=?",[req.body.graduation_year||new Date().getFullYear(),req.params.id]);
 res.json({ok:true});
});
app.post("/api/admin/resources",adminOnly,async(req,res)=>{
 const {title,category,description,url,access_level="student"}=req.body;
 const r=await run("INSERT INTO resources(title,category,description,url,access_level) VALUES(?,?,?,?,?)",[title,category,description,url,access_level]);
 res.json({id:r.lastID});
});
app.post("/api/admin/leaders",adminOnly,async(req,res)=>{
 const {name,title,years_served,achievements,photo_url}=req.body;
 const r=await run("INSERT INTO leaders(name,title,years_served,achievements,photo_url) VALUES(?,?,?,?,?)",[name,title,years_served,achievements,photo_url||""]);
 res.json({id:r.lastID});
});
app.get("/api/leaders",async(req,res)=>res.json(await all("SELECT * FROM leaders ORDER BY id DESC")));
app.post("/api/admin/hall-of-fame",adminOnly,async(req,res)=>{
 const {student_name,graduation_year,achievement,score,verified_by}=req.body;
 const r=await run("INSERT INTO hall_of_fame(student_name,graduation_year,achievement,score,verified_by) VALUES(?,?,?,?,?)",[student_name,graduation_year,achievement,score,verified_by]);
 res.json({id:r.lastID});
});
app.get("/api/hall-of-fame",async(req,res)=>res.json(await all("SELECT * FROM hall_of_fame ORDER BY graduation_year DESC")));
app.post("/api/admin/news",adminOnly,async(req,res)=>{
 const {title,type,content,event_date}=req.body;
 const r=await run("INSERT INTO news(title,type,content,event_date) VALUES(?,?,?,?)",[title,type,content,event_date]);
 res.json({id:r.lastID});
});
app.get("/api/news",async(req,res)=>res.json(await all("SELECT * FROM news ORDER BY id DESC")));

app.get("/api/health",(req,res)=>res.json({ok:true,service:"Worikambo R/C JHS API",runtime:isVercel?"vercel":"node"}));

// The initialization promise is awaited by the Vercel function wrapper.
app.locals.ready = init();

if(require.main === module){
 app.locals.ready.then(()=>app.listen(PORT,()=>console.log(`Worikambo server running at http://localhost:${PORT}`)));
}

module.exports = app;
