const { runHttpQuery } = require("apollo-server-core");
const schema = require('./schema') ;
const app = require('express')();

app.use(
  '/graphql',
  require("body-parser").text(),
  graphqlDecode,
  myGraphqlExpressImplementation
);

async function graphqlDecode(req, res, next) {
    try {
      if (req.get("x-content-transfer-encoding") === "base64") {
        const str = await decodeTextBody(req.body); // decoding
        req.body = JSON.parse(str);
        req.headers["content-type"] = "application/json";
        req.graphqlWasEncoded = true;
      }
      next();
    } catch (e) {
      print(`Error! ${e.message}`);
      next(e);
    }
}

async function myGraphqlExpressImplementation(req, res, next) {
    try {
      let gqlResponse = await runHttpQuery([req, res], {
                        method: req.method,
                        options: {
                          schema
                        },
                        query: req.method === "POST" ? req.body : req.query
                      });
      gqlResponse = gqlResponse.graphqlResponse;
      console.log(gqlResponse);
      let type = "application/json";
      if (req.graphqlWasEncoded) {
        gqlResponse = await encodeTextBody(gqlResponse); // encoding
        console.log(gqlResponse);
        type = "text/plain";
        res.setHeader("x-content-transfer-encoding", "base64");
      }
      res.setHeader("content-type", type);
      res.setHeader(
        "content-length",
        Buffer.byteLength(gqlResponse, "utf8").toString()
      );
      res.write(gqlResponse);
      res.end();
    } catch (error) {
      const errorobj = {
        error: error.message
      }
      res.setHeader("content-type", "application/json");
      res.setHeader(
        "content-length",
        Buffer.byteLength(errorobj, "utf8").toString()
      );
      res.write(errorobj);
      res.end();
    }
}

new Promise(resolve => app.listen(resolve => app.listen({port: 4010}, resolve)));

async function decodeTextBody(text) {
  let buffer = Buffer.from(text, "base64");
  return Buffer.from(buffer).toString("utf8");
}

async function encodeTextBody(text) {
  console.log(text);
  let buffer = new Uint8Array(new TextEncoder().encode(text));
  const encodedText = Buffer.from(String.fromCharCode.apply(null, buffer)).toString('base64');
  return encodedText;
}

new Promise(resolve => app.listen(resolve => app.listen({port: 4100}, resolve)));