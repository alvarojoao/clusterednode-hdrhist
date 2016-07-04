require('pmx').init({
                        http:          true, // HTTP routes logging (default: true)
                        errors:        true, // Exceptions loggin (default: true)
                        custom_probes: true, // Auto expose JS Loop Latency and HTTP req/s as custom metrics
                        network:       true, // Network monitoring at the application level
                        ports:         false // Shows which ports your app is listening on (default: false)
                    });
var https     = require('https'),
    hdr       = require('native-hdr-histogram'),
    fs        = require('fs'),
    BigNumber = require('bignumber.js');
var server = https.createServer({
                                    key:  fs.readFileSync('./nginx-selfsigned.key'),
                                    cert: fs.readFileSync('./nginx-selfsigned.crt')
                                }, function(req, res) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', 'Mon, 26 Jul 1997 05:00:00 GMT');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Pragma, Cache-Control, If-Modified-Since, X-ReqId");
    res.setHeader("Content-Type", "application/json");
    var histogram = undefined;
    if (req.method === 'POST') {
        var body = '';
        req.on('data', function(data) { body += data; });
        req.on('end', function() {
            var data = JSON.parse(body), min = 999999, max = 0;
            for (var i = 0; i < data.arr.length; i++) {
                if (data.arr[i] < min) {
                    min = data.arr[i];
                }
                if (data.arr[i] > max) {
                    max = data.arr[i];
                }
            }
            var results = {"table": [], "chart": []};
            var results1 = [
                {"percentile": 50, "value": 0},
                {"percentile": 75, "value": 0},
                {"percentile": 87.5, "value": 0},
                {"percentile": 93.75, "value": 0},
                {"percentile": 96.875, "value": 0},
                {"percentile": 98.4375, "value": 0},
                {"percentile": 99.21875, "value": 0},
                {"percentile": 100, "value": 0}
            ];
            var results2 = [];
            var seventyfive = new BigNumber("75");
            var three9 = new BigNumber("99.9");
            var four9 = new BigNumber("99.99");
            var five9 = new BigNumber("99.999");
            var decIncr = new BigNumber("0.1");
            var centIncr = new BigNumber("0.01");
            var miliIncr = new BigNumber("0.001");
            for (i = 1; i < 75; i++) {
                results2.push({"percentile": i, "value": 0});
            }
            for (var j = seventyfive; j.lt(three9); j = j.plus(decIncr)) {
                results2.push({"percentile": j.toNumber(), "value": 0});
            }
            for (j = three9; j.lt(four9); j = j.plus(centIncr)) {
                results2.push({"percentile": j.toNumber(), "value": 0});
            }
            for (j = four9; j.lte(five9); j = j.plus(miliIncr)) {
                results2.push({"percentile": j.toNumber(), "value": 0});
            }
            results2.push({"percentile": 100, "value": 0});
            try {
                histogram = new hdr(min, max, 5);
                for (i = 0; i < data.arr.length; i++)
                    histogram.record(data.arr[i]);
                for (i = 0; i < results1.length; i++) {
                    results1[i].value = histogram.percentile(results1[i].percentile);
                }
                for (i = 0; i < results2.length; i++) {
                    results2[i].value = histogram.percentile(results2[i].percentile);
                }
                histogram = undefined;
                results.table = results1;
                results.chart = results2;
            }
            catch (e) {
                console.log(e);
            }
            histogram = undefined;
            res.end(JSON.stringify(results));
        });
    }
    else {
        res.end('{"table":[],"chart":[]}');
    }
}).listen(process.env.NODEPORT);
process.on('SIGINT', function() {
    server.close();
    setTimeout(function() { process.exit(0); }, 300);
});
