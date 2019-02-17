const http = require("http");
const fs = require("fs");
const querystring = require("querystring");

//create elemental HTTP server
const server = http.createServer((req, res) => {
  //this is destructuring = this equals url = req.url
  console.log(req.headers);
  console.log(req.method);
  const { url } = req;
  console.log(url);
  if (req.method === "GET") {
    let element = url.slice(1, url.length - 5);
    console.log(element);
    if (url === "/") {
      fs.readFile("./public/index.html", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.write(data.toString());
          res.end();
        }
      });
    } else if (url === `/${element}.html` && element !== null) {
      fs.readFile(`./public/element/${element}.html`, (err, data) => {
        if (err) {
          console.log(err);
          fs.readFile(`./public/404.html`, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              res.write(data.toString());
              res.end();
            }
          });
        } else {
          res.write(data.toString());
          res.end();
        }
      });
    } else if (url === "/css/styles.css") {
      fs.readFile("./public/css/styles.css", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.write(data.toString());
          res.end();
        }
      });
    } else if (url === "/favicon.ico") {
      console.log("Favicon Missing!");
    }
  } else if (req.method === "POST") {
    if (url === "/elements") {
      req.on("data", data => {
        console.log(data.toString());
        const dataObj = querystring.parse(data.toString());
        console.log(dataObj);
        const elemTemp = `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>The Elements - ${dataObj.elementName}</title>
            <link rel="stylesheet" href="/css/styles.css" />
          </head>
        
          <body>
            <h1>${dataObj.elementName}</h1>
            <h2>${dataObj.elementSymbol}</h2>
            <h3>Atomic number ${dataObj.elementAtomicNumber}.</h3>
            <p>${dataObj.elementDescription}</p>
            <p><a href="/">back</a></p>
          </body>
        </html>`;

        const filePath =
          "./public/element/" + dataObj.elementName.toLowerCase() + ".html";

        fs.writeFile(filePath, elemTemp, err => {
          if (err) {
            console.log(err);
          } else {
            console.log("NEW FILE CREATED!");
          }
        });
        createIndex();
      });
    }
    req.on("end", () => {
      console.log("request ended");
    });
    res.end("Data received, Thank you!");
  } else if (req.method === "DELETE") {
    fs.exists(`./public/element${url}`, function(exists) {
      if (exists) {
        console.log("File exists and will be deleted!");
        fs.unlinkSync("./public/element" + url);
        createIndex();
      }
    });
    res.end("Data deleted");
  }
  const createIndex = function() {
    let newElemArr = [];
    fs.readdir(__dirname + "/public/element", (err, files) => {
      if (err) {
        console.log(err);
      } else {
        files.map(x => {
          newElemArr.push(x.split(".")[0].toLowerCase());
        });
      }

      fs.writeFile("./public/index.html", newElementIndex(), err => {
        if (err) {
          console.log(err);
        } else {
          console.log("INDEX FILE UPDATED!");
        }
      });
    });

    const newElementIndex = function() {
      let listOfElem = "";
      newElemArr.forEach(x => {
        listOfElem += `<li>
        <a href="/${x}.html">${x.charAt(0).toUpperCase() +
          x.slice(1, x.length)}</a>
      </li>\n`;
      });
      return `<!DOCTYPE html>
          <html lang="en">
          <head>
           <meta charset="UTF-8" />
       <title>The Elements</title>
        <link rel="stylesheet" href="/css/styles.css" />
        </head>

      <body>
         <h1>The Elements</h1>
         <h2>These are all the known elements.</h2>
         <h3>These are ${newElemArr.length}</h3>
         <ol>${listOfElem}</ol>
         </body>
        </html>`;
    };
  };
});

server.listen(8080, () => {
  console.log("port open!");
});
