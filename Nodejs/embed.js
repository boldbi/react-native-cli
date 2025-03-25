var fs = require("fs");
var http = require("http");
var https = require("https");
var url = require("url");
var express = require('express');
var cors = require('cors');
var app = express();
var crypto = require('crypto');
const path = require('path');

app.use(cors());
//Parse JSON bodies (as sent by API clients).
app.use(express.json());

//Assign a port number for an API to run.
const port = 8080;

let appconfig;
try {
appconfig = JSON.parse(fs.readFileSync('embedConfig.json'));
} catch (error) {
console.error('Error: embedConfig.json file not found.');
process.exit(1);
}

var embedSecret = appconfig.EmbedSecret;
var userEmail = appconfig.UserEmail;

app.post('/authorizationserver',  async function (req, response){
var embedQuerString = req.body.embedQuerString;
var dashboardServerApiUrl = req.body.dashboardServerApiUrl;

embedQuerString += "&embed_user_email=" + userEmail;
embedQuerString += "&embed_server_timestamp=" + Math.round((new Date()).getTime() / 1000);
var embedSignature = "&embed_signature=" + GetSignatureUrl(embedQuerString);
var embedDetailsUrl = "/embed/authorize?" + embedQuerString+embedSignature;

var serverProtocol = url.parse(dashboardServerApiUrl).protocol == 'https:' ? https : http;
serverProtocol.get(dashboardServerApiUrl+embedDetailsUrl, function(res){
    var str = '';
    res.on('data', function (chunk) {
    str += chunk;
    });
    res.on('end', function () {
    response.send(str);
    });
});
})

function GetSignatureUrl(queryString)
{
var keyBytes = Buffer.from(embedSecret);
var hmac = crypto.createHmac('sha256', keyBytes);
data = hmac.update(queryString);
gen_hmac= data.digest().toString('base64');

return gen_hmac;
}
app.get('/getdetails', (req, res) => {
    const serverEmbedConfigData = path.join(__dirname, 'embedConfig.json');
    const jsonData = fs.readFileSync(serverEmbedConfigData, 'utf8');
    const parsedData = JSON.parse(jsonData);

    const clientEmbedConfigData = {
        DashboardId: parsedData.DashboardId, ServerUrl: parsedData.ServerUrl, SiteIdentifier: parsedData.SiteIdentifier, EmbedType: parsedData.EmbedType, Environment: parsedData.Environment
    };
    res.send(clientEmbedConfigData);
});

app.listen(port, () => {
console.log(`Server is running on port ${port}`);
}); 