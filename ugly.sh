#!/usr/bin/env bash
echo Minify nosock.js
uglifyjs hdrsrv.js --screw-ie8 -c sequences,dead_code,conditionals,comparisons,unsafe_comps,evaluate,booleans,loops,unused,if_return,join_vars,collapse_vars,cascade,passes=3 -m toplevel,eval -r '$,require,exports' -o hdrsrv.js --source-map hdrsrv.js.map --source-map-include-sources --stats
echo Finished minifying files
