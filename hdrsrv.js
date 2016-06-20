require('pmx').init({
                        http:          true, // HTTP routes logging (default: true)
                        errors:        true, // Exceptions loggin (default: true)
                        custom_probes: true, // Auto expose JS Loop Latency and HTTP req/s as custom metrics
                        network:       true, // Network monitoring at the application level
                        ports:         false // Shows which ports your app is listening on (default: false)
                    });
var http2 = require('http2'),
    hdr   = require('native-hdr-histogram'),
    fs    = require('fs');
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
            var results2 = [
                {"percentile": 1, "value": 0},
                {"percentile": 10, "value": 0},
                {"percentile": 20, "value": 0},
                {"percentile": 30, "value": 0},
                {"percentile": 40, "value": 0},
                {"percentile": 50, "value": 0},
                {"percentile": 60, "value": 0},
                {"percentile": 70, "value": 0},
                {"percentile": 75, "value": 0},
                {"percentile": 80, "value": 0},
                {"percentile": 85, "value": 0},
                {"percentile": 90, "value": 0},
                {"percentile": 91, "value": 0},
                {"percentile": 92, "value": 0},
                {"percentile": 93, "value": 0},
                {"percentile": 94, "value": 0},
                {"percentile": 95, "value": 0},
                {"percentile": 96, "value": 0},
                {"percentile": 97, "value": 0},
                {"percentile": 98, "value": 0},
                {"percentile": 99, "value": 0},
                {"percentile": 99.1, "value": 0},
                {"percentile": 99.2, "value": 0},
                {"percentile": 99.3, "value": 0},
                {"percentile": 99.4, "value": 0},
                {"percentile": 99.5, "value": 0},
                {"percentile": 99.6, "value": 0},
                {"percentile": 99.7, "value": 0},
                {"percentile": 99.8, "value": 0},
                {"percentile": 99.9, "value": 0},
                {"percentile": 99.91, "value": 0},
                {"percentile": 99.92, "value": 0},
                {"percentile": 99.93, "value": 0},
                {"percentile": 99.94, "value": 0},
                {"percentile": 99.95, "value": 0},
                {"percentile": 99.96, "value": 0},
                {"percentile": 99.97, "value": 0},
                {"percentile": 99.98, "value": 0},
                {"percentile": 99.99, "value": 0},
                {"percentile": 99.991, "value": 0},
                {"percentile": 99.992, "value": 0},
                {"percentile": 99.993, "value": 0},
                {"percentile": 99.994, "value": 0},
                {"percentile": 99.995, "value": 0},
                {"percentile": 99.996, "value": 0},
                {"percentile": 99.997, "value": 0},
                {"percentile": 99.998, "value": 0},
                {"percentile": 99.999, "value": 0},
                {"percentile": 99.9991, "value": 0},
                {"percentile": 99.9992, "value": 0},
                {"percentile": 99.9993, "value": 0},
                {"percentile": 99.9994, "value": 0},
                {"percentile": 99.9995, "value": 0},
                {"percentile": 99.9996, "value": 0},
                {"percentile": 99.9997, "value": 0},
                {"percentile": 99.9998, "value": 0},
                {"percentile": 99.9999, "value": 0},
                {"percentile": 99.99991, "value": 0},
                {"percentile": 99.99992, "value": 0},
                {"percentile": 99.99993, "value": 0},
                {"percentile": 99.99994, "value": 0},
                {"percentile": 99.99995, "value": 0},
                {"percentile": 99.99996, "value": 0},
                {"percentile": 99.99997, "value": 0},
                {"percentile": 99.99998, "value": 0},
                {"percentile": 99.99999, "value": 0},
                {"percentile": 100, "value": 0}
            ];
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
}).listen(8012);
process.on('SIGINT', function() {
    server.close();
    setTimeout(function() { process.exit(0); }, 300);
});
