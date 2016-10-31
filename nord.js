/*
 * Copyright (C) 2016 Freie Universität Berlin
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA  02110-1301, USA.
 */

/**
 * @fileoverview    CoAP Resource Directory
 *
 * Used variables:
 * 'd'      domain
 * 'ep'     endpoint name
 * 'res'    resource
 * 'gp'     group name
 * 'page'   together with count - page of results
 * 'count'  together with page - number of entries per page
 * 'rt'     resource type
 * 'et'     endpoint type
 * 'lt'     lifetime
 *
 * @author          Hauke Petersen <hauke.petersen@fu-berlin.de>
 */

/**
 * Setup the base configuration
 */
const COAP_PORT     = 5683;
const USE_IPTYPE    = 'udp6';       /* choose udp6 or udp for ipv6 or ipv4 */
const LOOKUP_BASE   = 'rd-lookup';

/**
 * Load Node packages and initialize global variables
 */
const coap          = require('coap');
const coap_server   = coap.createServer({'type': USE_IPTYPE});
const url           = require('url');
const qs            = require('query-string');

/**
 * The eps object holds all the endpoints provided by the server
 */
 var eps = {};

/**
 * For now, this object holds the actual directory database
 */
 var rd = {};

/**
 * Define some CoAP helpers
 */
var coap_resp = function(code, res, data) {
    res.statusCode = code;
    res.end(data);
};

/**
 * Definition of CoAP endpoints
 */
// var ep_wellknown_core = function(req, res, path, query) {
//     console.log('EP_WELLKNOWN_CORE');

//     /* POST on /.well-known/core: simple publishing (draft-sec5.1) */
//     if (req.method == 'POST') {
//         console.log('RD: simple publishing triggered (draft-sec5.1)');
//         if (query.con) {
//             console.log("RD: doing lookup to specified context");
//             ctx = url.parse(query.con.replace(/"/g,""));
//             console.log(query.con, ctx);
//             console.log("RD: addr ", ctx.hostname, ctx.port);
//         }
//         else {
//             console.log("RD: doing lookup to default context");
//             console.log("RD: addr", req.rsinfo.address, ":", req.rsinfo.port);
//         }
//         return;
//     }
//     else if (req.method == 'GET') {

//     }

//     res.setOption("Content-Format", "application/link-format");
//     res.end(links);
// };d

var discover_simple = function(peer)
{
    console.log("DISCOVER SIMPLE");
    console.log(peer);
    console.log("discover_simple: asking", peer.address, peer.port);

    var req = coap.request({'host': peer.address,
                            'port': peer.port,
                            'pathname': '/.well-known/core'});

    req.on('response', function(res) {
        res.pipe(process.stdout);
        res.on('end', function() {
            console.log("discover_simple: finished");
        });
    });

    console.log("now sending request");
    req.end();
}


var ep_wellknown_core = function(req, res) {
    console.log('EP_WELLKNOWN_CORE');

    if (req.method == 'GET') {
        var links = "";
        for (ep in eps) {
            links += "<" + ep + ">";
            for (l in eps[ep].meta) {
                links += ';' + l + '="' + eps[ep]['meta'][l] + '"';
            }
            links += ",";
        }

        res.statusCode = 205;
        res.setOption("Content-Format", "application/link-format");
        res.end(links);
        return;
    }
    else if (req.method == 'POST') {
        console.log("POST to /.well-known/core, len:", req.payload.length);
        coap_resp(204, res);
        discover_simple(req.rsinfo);
        return;
    }

    coap_resp(405, res);
};

eps['/.well-known/core'] = {
    'cb': ep_wellknown_core,
    'meta': {
        'title': "Discover me"
    }
};

var ep_test = function(req, res) {
    console.log("EP_TEST");

    res.statusCode = 205;
    res.setOption("Content-Format", "text/plain");
    res.end("Hello foobar!");
}

eps['/test'] = {
    'cb': ep_test,
    'meta': {
        'title': "Test endpoint",
        'ct': "text/plain"
    }
};

var ep_lookup = function(req, res, path, query) {
    console.log("LOOKUP");
};

var ep_test = function(req, res) {
    console.log('EP_TEST');
    foo = {'test': 123, 'foo': 'bar'};

    res.setOption("Content-Format", "application/json");
    res.end(JSON.stringify(foo));
};

// var eps = {
//     '/.well-known/core': {
//         'cb': ep_wellknown_core,
//         'desc': {'title': "Discover me"}
//     },
//     '/rd': {
//         'cb': ep_rd,
//         'desc': {'title': "resource directory"}
//     },
//     '/rd-lookup/d'
//     '/test': {
//         'cb': ep_test,
//         'desc': {'title': "Some test resource", 'rt': "Test RT"}
//     }
// };

/**
 * Setup CoAP server
 */
coap_server.on('request', function(req, res) {
    /* is request a ping? */
    if ((req.code == '0.00') && (req.payload.length == 0)) {
        coap_resp(0, res, null);
        return;
    }

    u = url.parse(req.url);
    if (u.pathname in eps) {
        eps[u.pathname].cb(req, res);
        return;
    }

    // query = qs.parse(u.query);
    // path = u.pathname.split("/");

    // console.log(req.rsinfo);
    // console.log(req.url, u.pathname, u.query);
    // console.log(query, path);

    // if (u.pathname == '/.well-known/core') {
    //     ep_wellknown_core(req, res, path, query);
    //     return;
    // }
    // if (path[1] == LOOKUP_BASE) {
    //     ep_lookup(req, res, path, query);
    // }


    coap_resp(404, res);
});

/**
 * Start everything
 */
coap_server.listen(COAP_PORT, function() {
    console.log("CoAP server running at coap://[::1]:" + COAP_PORT);
})
