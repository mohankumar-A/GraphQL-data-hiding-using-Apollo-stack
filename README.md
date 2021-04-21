# GraphQL-data-hiding-using-Apollo-stack
If your website have a private GraphQL API and you don’t want people to see plain queries and responses in a browser DevTools then here is how you mangle the traffic using Apollo stack libraries.
# The idea
Encode or encrypt the GraphQL data being sent end received.
# The bellow assumes that:
- You are using GraphQL Apollo server (however, you can apply the code to any other server)
- You are using HTTP POST requests to send and receive data (of course you can use the code below for all other protocols out there).
- You are using Apollo Client on the client side (however, surely you can apply the code below to any other client side module).
# We will:
- hijack the sent Apollo Client requests,
- convert the JSON string to a binary buffer,
- encrypt the buffer (optional),
- serialise it as base64,
- change Content-Type HTTP header from application/json to text/plain,
- add the standard Content-Transfer-Encoding: base64 HTTP header,
- and send it to the server.
# On the server side we will:
- add our middleware right before Apollo GraphQL server middleware,
- use the Content-Transfer-Encoding header to detect if the body requires decryption,
- convert the base64 string to a binary buffer,
- decrypt the buffer (optional),
- serialise it as UTF-8 to a JSON string,
- overwrite the HTTP header Content-Type to be application/json,
- pass the request to Apollo server.
- Do the same in reverse for the server replies — hijack and encode on server, hijack and decode on client.
# Downsides
Please note the following:
- This is not real data protection. It is impossible to securely encrypt data on the client side AFAIK, since the private key will be kept in browser JavaScript code. The approach is good just to obfuscate the GraphQL requests and de-obfuscate the responses.
- You might want to turn this off for local development and enable only in production/staging environments. (See below.)
