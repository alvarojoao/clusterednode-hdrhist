require('pmx').init({
                        http:          true, // HTTP routes logging (default: true)
                        errors:        true, // Exceptions loggin (default: true)
                        custom_probes: true, // Auto expose JS Loop Latency and HTTP req/s as custom metrics
                        network:       true, // Network monitoring at the application level
                        ports:         false // Shows which ports your app is listening on (default: false)
                    });
var http2 = require('http2'),
    fs    = require('fs'),
    hdr   = require('native-hdr-histogram');
var server = http2.createServer({
                                    key:  fs.readFileSync('./nginx-selfsigned.key'),
                                    cert: fs.readFileSync('./nginx-selfsigned.crt')
                                }, function(req, res) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', 'Mon, 26 Jul 1997 05:00:00 GMT');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Pragma, Cache-Control, If-Modified-Since, X-ReqId");
    res.setHeader("Content-Type", "application/json");
    if (req.method === 'POST') {
        var body = '';
        req.on('data', function(data) { body += data; });
        req.on('end', function() {
            console.log(body);
            var data = JSON.parse(body), min = 999999, max = 0;
            for (var i = 0; i < data.arr.length; i++) {
                if (data.arr[i] < min) {
                    min = data.arr[i];
                }
                if (data.arr[i] > max) {
                    max = data.arr[i];
                }
            }
            console.log(min, max);
            var results = [
                {"percentile": 50, "value": 0},
                {"percentile": 75, "value": 0},
                {"percentile": 87.5, "value": 0},
                {"percentile": 93.75, "value": 0},
                {"percentile": 96.875, "value": 0},
                {"percentile": 98.4375, "value": 0},
                {"percentile": 99.21875, "value": 0},
                {"percentile": 100, "value": 0}
            ];
            try {
                var histogram = new hdr(min, max);
                for (i = 0; i < data.arr.length; i++) {
                    histogram.record(data.arr[i]);
                }
                for (i = 0; i < results.length; i++) {
                    results[i].value = histogram.percentile(results[i].percentile);
                }
            }
            catch (e) {
                console.log(e);
            }
            res.end(JSON.stringify(results));
        });
    }
    else {
        res.end('{}');
    }
}).listen(8012);
process.on('SIGINT', function() {
    server.close();
    setTimeout(function() { process.exit(0); }, 300);
});
