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

// var req = coap.request({'host': '::1',
//                         'port': 12345,
//                         'pathname': '/.well-known/core'});
var req = coap.request("coap://[::1]/.well-known/core");

req.on('response', function(res) {
    res.pipe(process.stdout);
    res.on('end', function() {
        console.log("discover_simple: finished");
    });
});

console.log("now sending request");
req.end("foobar");
console.log("done");
