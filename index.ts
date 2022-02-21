import Database from "better-sqlite3";
import cors from "cors";
import express from "express";

const app = express();
const PORT = 4000;
app.use(cors());
app.use(express.json());

const db = new Database("./data.db", {
  verbose: console.log,
});


  const getMuseums = db.prepare(`
  SELECT * FROM museums;
  `);
  const getWorksByMuseumId = db.prepare(`
  SELECT * FROM works 
  WHERE works.museumId = ?;
  `);
  app.get("/museums", (req, res) => {
    const museums = getMuseums.all();
    for (const museum of museums) {
      const works = getWorksByMuseumId.all(museum.id);
      museum.works = works;
    }
    res.send(museums);
  });
  
  const getMuseumById = db.prepare(`
  SELECT * FROM museums WHERE id = ?;
  `);
  
  app.get("/museums/:id", (req, res) => {
    const id = req.params.id;
  
    const museum = getMuseumById.get(id);
  
    if (museum) {
      const works = getWorksByMuseumId.all(id);
      museum.works = works;
      res.send(museum);
    } else {
      res.status(404).send({ error: "Museum with that id does not exists!" });
    }
  });
  
  const getWorks = db.prepare(`
  SELECT * FROM works;
  `);
  
  app.get("/works", (req, res) => {
    const works = getWorks.all();
    for (const work of works) {
      const museum = getMuseumById.get(work.museumId);
      work.museum = museum;
    }
    res.send(works);
  });
  
  const getWorkById = db.prepare(`
  SELECT id,name,image FROM works WHERE id = ?;
  `);
  
  app.get("/works/:id", (req, res) => {
    const id = req.params.id;
  
    const work = getWorkById.get(id);
    if (work) {
      const museum = getMuseumById.get(id);
      work.museum = museum;
      res.send(work);
    } else {
      res.status(404).send({ error: "Work with that id does not exists!" });
    }
  });
  const addMuseum = db.prepare(`
  INSERT INTO museums (name, city) VALUES (?,?);
  `);
  app.post("/museums", (req, res) => {
    const { name, city } = req.body;
  
    const errors = [];
  
    if (typeof name !== "string")
      errors.push({ error: "name is missing or its not a string!" });
  
    if (typeof city !== "string")
      errors.push({ error: "city is missing or its not a string!" });
  
    if (errors.length === 0) {
      const info = addMuseum.run(name, city);
      const museum = getMuseumById.get(info.lastInsertRowid);
      res.send(museum);
    }
    res.send(errors);
  });
  
  const addWork = db.prepare(`
  INSERT INTO works (name, image, museumId) VALUES (?,?,?);
  `);
  app.post("/works", (req, res) => {
    const { name, image, museumId } = req.body;
  
    const errors = [];
  
    if (typeof name !== "string")
      errors.push({ error: "name is missing or its not a string!" });
  
    if (typeof image !== "string")
      errors.push({ error: "city is missing or its not a string!" });
  
    if (typeof museumId !== "number")
      errors.push({ error: "museumId is missing or its not a number!" });
  
    if (errors.length === 0) {
      const info = addWork.run(name, image, museumId);
      const work = getWorkById.get(info.lastInsertRowid);
      res.send(work);
    }
    res.status(406).send(errors);
  });
  
  const deleteMuseumById = db.prepare(`
  DELETE FROM museums WHERE id = ?;
  `);
  const deleteWorksByMuseumId = db.prepare(`
  DELETE FROM works WHERE museumId = ?;
  `);
  app.delete("/museums/:id", (req, res) => {
    const id = req.params.id;
    const match = getMuseumById.get(id);
  
    if (match) {
      deleteWorksByMuseumId.run(id);
      deleteMuseumById.run(id);
      res.send("Museum deleted succesfully!");
    } else {
      res.status(404).send({ error: "No museum finded with that id!" });
    }
  });
  
  const deleteWorkById = db.prepare(`
  DELETE FROM works WHERE id = ?
  `);
  
  app.delete("/works/:id", (req, res) => {
    const id = req.params.id;
    const match = getWorkById.get(id);
    if (match) {
      deleteWorkById.run(id);
      res.send("Work deleted succesfully!");
    } else {
      res.status(404).send({ error: "No work finded with that Id!" });
    }
  });
  app.listen(PORT, () => {
    console.log(`Server is up and running on: http://localhost:${PORT} `);
  });