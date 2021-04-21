const { ApolloClient } = require('apollo-client') ;
const { gql } = require('apollo-server');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { HttpLink } = require('apollo-link-http');
const { XMLHttpRequest } = require("xmlhttprequest");

const client = new ApolloClient({
    link: new HttpLink({
        uri: 'http://localhost:4100/graphql',
        fetch: myFetchFunction,
    }),
    cache: new InMemoryCache(),
    connectToDevTools: true
});

const MY_QUERY = gql`
  query books {
    books {
      title
      author
    }
  }
`;

client.query({query: MY_QUERY}).then((res) => console.log(res.data));

function myFetchFunction(url, options = {}) {
    const isEncoding = shouldEncode(url, options);

    return new Promise(async (resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open(options.method || "get", url);

        for (let i in options.headers) {
            if (isEncoding && i.toLowerCase() === "content-type") {
                req.setRequestHeader(i, "text/plain; charset=UTF-8");
                req.setRequestHeader("x-content-transfer-encoding", "base64");
            } else {
                req.setRequestHeader(i, options.headers[i]);
            }
        }

        // Some additional necessary bits of the fetch() standard function
        req.withCredentials = options.credentials == "include";
        req.onload = () => {
            resolve(response(req));
        };
        req.onerror = reject;

        let body = options.body;
        req.send(isEncoding ? await encodeTextBody(body) : body);
    });
}

function shouldEncode(url, options = {}) {
    if (process.env.NODE_ENV === "development") return false;
    if (!options.method || options.method.toLowerCase() !== "post") return false;
    url = url.split("?")[0].split("#")[0];
    if (!url.endsWith("/graphql")) return false;
    return true;
}

function encodeTextBody(text) {
    let buffer = new Uint8Array(new TextEncoder().encode(text));
    const encodedText = Buffer.from(String.fromCharCode.apply(null, buffer)).toString('base64');
    return encodedText;
}

function response(req) {
    let keys = [], all = [], headers = {}, header;
    let isCrypting = true;
    req.getAllResponseHeaders().
    replace(/^(.*?):\s*([\s\S]*?)$/gm, (m, key, value) => {
        keys.push((key = key.toLowerCase()));
        all.push([key, value]);
        header = headers[key];
        headers[key] = header ? `${header},${value}` : value;
    });

    return {
      ok: ((req.status / 200) | 0) == 1,
      status: req.status,
      statusText: req.statusText,
      url: req.responseURL,
      clone: response,
      text: async () => (isCrypting ?
        await decodeTextBody(req.responseText) : // decoding
        req.responseText
      ),
      json: async () => JSON.parse(isCrypting ?
        await decodeTextBody(req.responseText) : // decoding
        req.responseText
      ),
      blob: () => Promise.resolve(new Blob([req.response])),
      headers: {
        keys: () => keys,
        entries: () => all,
        get: n => headers[n.toLowerCase()],
        has: n => n.toLowerCase() in headers
      }
    };
}

function decodeTextBody(text) {
    const decodedText = Buffer.from(text, 'base64').toString()
    return decodedText;
}