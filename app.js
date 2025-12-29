const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const Person = require("./models/Person");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));

// ✅ MongoDB Connection (latest compatible)
mongoose.connect("mongodb://127.0.0.1:27017/persondb")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// ---------------- ROUTES ----------------

// GET /person – List all people
app.get("/person", async (req, res) => {
  const people = await Person.find();

  const rows = people.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${p.age}</td>
      <td>${p.gender}</td>
      <td>${p.mobile}</td>
      <td>
        <a href="/person/${p._id}/edit">Edit</a> |
        <a href="/person/${p._id}/delete">Delete</a>
      </td>
    </tr>
  `).join("");

  res.send(`
    <html>
    <head>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <h2>Person List</h2>
      <a href="/person/new" class="add-btn">Add Person</a>
      <table>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Mobile</th>
          <th>Action</th>
        </tr>
        ${rows}
      </table>
    </body>
    </html>
  `);
});

// GET /person/new – Create form
app.get("/person/new", (req, res) => {
  res.send(`
    <html>
    <head>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <h2>Add Person</h2>
      <form method="POST" action="/person">
        Name: <input name="name" required />
        Age: <input name="age" />
        Gender: <input name="gender" />
        Mobile: <input name="mobile" />
        <button type="submit">Save</button>
      </form>
    </body>
    </html>
  `);
});

// POST /person – Save new person
app.post("/person", async (req, res) => {
  await Person.create(req.body);
  res.redirect("/person");
});

// GET /person/:id/edit – Edit form
app.get("/person/:id/edit", async (req, res) => {
  const p = await Person.findById(req.params.id);

  res.send(`
    <html>
    <head>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <h2>Edit Person</h2>
      <form method="POST" action="/person/${p._id}?_method=PUT">
        Name: <input name="name" value="${p.name}" />
        Age: <input name="age" value="${p.age}" />
        Gender: <input name="gender" value="${p.gender}" />
        Mobile: <input name="mobile" value="${p.mobile}" />
        <button type="submit">Update</button>
      </form>
    </body>
    </html>
  `);
});

// PUT /person/:id – Update person
app.put("/person/:id", async (req, res) => {
  await Person.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/person");
});

// GET /person/:id/delete – Delete confirmation
app.get("/person/:id/delete", async (req, res) => {
  const p = await Person.findById(req.params.id);

  res.send(`
    <html>
    <head>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <h2>Delete Person</h2>
      <form method="POST" action="/person/${p._id}?_method=DELETE">
        <p>Are you sure you want to delete <b>${p.name}</b>?</p>
        <button type="submit" class="delete-btn">Yes, Delete</button>
      </form>
      <br>
      <center><a href="/person">Cancel</a></center>
    </body>
    </html>
  `);
});

// DELETE /person/:id – Delete record
app.delete("/person/:id", async (req, res) => {
  await Person.findByIdAndDelete(req.params.id);
  res.redirect("/person");
});

// Start Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000/person");
});
