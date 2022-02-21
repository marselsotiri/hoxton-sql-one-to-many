import Database from 'better-sqlite3'

const db = new Database('./data.db', {
  verbose: console.log
})

const museums = [
    {
      name: 'Smithsonian Institution',
      city:'Washington'
    },
    {
      name: 'Le Louvre',
      city: 'Paris'
    },
    {
      name: 'The Acropolis Museum',
      city: 'Athens'
    }
  ]
  
  const works = [
    {
      name: 'Triceratops horridus Marsh',
      image: "https://ids.si.edu/ids/deliveryService?max_w=800&id=ark:/65665/m36f700e0824624238b03c209e155a12ad",
      museumId: 1
    },
    {
      name: 'John Deere Plow',
      image: "https://ids.si.edu/ids/deliveryService?max_w=800&id=NMAH-2003-35624",
      museumId: 1
    },
    {
      name: 'Coupe Fossin',
      image: "https://collections.louvre.fr/media/cache/small/0000000021/0000462081/0001003822_OG.JPG",
      museumId: 2
    },
    {
      name: 'Fragment de tête de roi, peut-être d`une statue-colonne',
      image: "https://collections.louvre.fr/media/cache/large/0000000021/0000091082/0001015852_OG.JPG",
      museumId: 2
    },
    {
      name: 'Spinning top',
      image: "https://www.theacropolismuseum.gr/sites/default/files/exhibits_images/8714_1.jpg",
      museumId: 3
    },
    {
        name: 'Amphora',
        image: "https://www.theacropolismuseum.gr/sites/default/files/exhibits_images/8822_1.jpg",
        museumId: 3
      }
  ]
  

const dropMuseums = db.prepare(`DROP TABLE IF EXISTS museums;`)
const dropWorks = db.prepare(`DROP TABLE IF EXISTS works;`)
dropWorks.run()
dropMuseums.run()

const createMuseums = db.prepare(`
CREATE TABLE museums (
  id     INTEGER,
  name   TEXT NOT NULL,
  city  TEXT NOT NULL,
  PRIMARY KEY(id)
);
`)

const createWorks = db.prepare(`
CREATE TABLE works (
  id    	INTEGER,
  name  	TEXT NOT NULL,
  image 	TEXT,
  museumId INTEGER NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(museumId) REFERENCES museums(id)
);`)

createWorks.run()
createMuseums.run()

const createMuseum = db.prepare(`
INSERT INTO museums (name, city) VALUES (?, ?);
`)

const createWork = db.prepare(`
INSERT INTO works (name, image, museumId) VALUES (?, ?, ?);
`)

for (const museum of museums) {
  createMuseum.run(museum.name, museum.city)
}

for (const work of works) {
  createWork.run(work.name, work.image, work.museumId)
}