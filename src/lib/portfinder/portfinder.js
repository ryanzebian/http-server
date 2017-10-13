/*
 * portfinder.js: A simple tool to find an open port on the current machine.
 *
 * (C) 2011, Charlie Robbins
 *
 */

"use strict";

var fs = require('fs'),
    os = require('os'),
    net = require('net'),
    path = require('path')
    ,eachSeries = require('async/eachSeries')

var internals = {};

internals.testPort = function (options, callback) {
    if (!callback) {
        callback = options;
        options = {};
    }

    options.port = options.port || exports.basePort;
    options.host = options.host || null;
    options.server = options.server || net.createServer(function () {
        //
        // Create an empty listener for the port testing server.
        //
    });

    

    function onListen() {
        options.server.removeListener('error', onError);
        options.server.close();
        callback(null, options.port);
    }

    function onError(err) {
        options.server.removeListener('listening', onListen);

        if (err.code !== 'EADDRINUSE' && err.code !== 'EACCES') {
            return callback(err);
        }

        internals.testPort({
            port: exports.nextPort(options.port),
            host: options.host,
            server: options.server
        }, callback);
    }

    options.server.once('error', onError);
    options.server.once('listening', onListen);
    options.server.listen(options.port, options.host);
};

//
// ### @basePort {Number}
// The lowest port to begin any port search from
//
exports.basePort = 8000;

//
// ### function getPort (options, callback)
// #### @options {Object} Settings to use when finding the necessary port
// #### @callback {function} Continuation to respond to when complete.
// Responds with a unbound port on the current machine.
//
exports.getPort = function (options, callback) {

    if (!callback) {
        callback = options;
        options = {};
    }



    var openPorts = [],
        currentHost;
    return eachSeries(exports._defaultHosts, function (host, next) {
        return internals.testPort({
            host: host,
            port: options.port
        }, function (err, port) {
            if (err) {
                
                currentHost = host;
                return next(err);
            } else {
                
                openPorts.push(port);
                return next();
            }
        });
    }, function (err) {

        if (err) {
            
            // If we get EADDRNOTAVAIL it means the host is not bindable, so remove it
            // from exports._defaultHosts and start over. For ubuntu, we use EINVAL for the same
            if (err.code === 'EADDRNOTAVAIL' || err.code === 'EINVAL') {
                if (options.host === currentHost) {
                    // if bad address matches host given by user, tell them
                    //
                    // NOTE: We may need to one day handle `my-non-existent-host.local` if users
                    // report frustration with passing in hostnames that DONT map to bindable
                    // hosts, without showing them a good error.
                    var msg = 'Provided host ' + options.host + ' could NOT be bound. Please provide a different host address or hostname';
                    return callback(Error(msg));
                }

                var idx = exports._defaultHosts.indexOf(currentHost);
                exports._defaultHosts.splice(idx, 1);
                return exports.getPort(options, callback);
            } else {
                // error is not accounted for, file ticket, handle special case
                return callback(err);
            }
        }

        // sort so we can compare first host to last host
        openPorts.sort(function (a, b) {
            return a - b;
        });

        

        if (openPorts[0] === openPorts[openPorts.length - 1]) {
            // if first === last, we found an open port
            return callback(null, openPorts[0]);
        } else {
            // otherwise, try again, using sorted port, aka, highest open for >= 1 host
            return exports.getPort({
                port: openPorts.pop(),
                host: options.host
            }, callback);
        }

    });
};

//
// ### function nextPort (port)
// #### @port {Number} Port to increment from.
// Gets the next port in sequence from the
// specified `port`.
//
exports.nextPort = function (port) {
    return port + 1;
};



/**
 * @desc List of internal hostnames provided by your machine. A user
 *       provided hostname may also be provided when calling portfinder.getPort,
 *       which would then be added to the default hosts we lookup and return here.
 *
 * @return {array}
 *
 * Long Form Explantion:
 *
 *    - Input: (os.networkInterfaces() w/ MacOS 10.11.5+ and running a VM)
 *
 *        { lo0:
 *         [ { address: '::1',
 *             netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
 *             family: 'IPv6',
 *             mac: '00:00:00:00:00:00',
 *             scopeid: 0,
 *             internal: true },
 *           { address: '127.0.0.1',
 *             netmask: '255.0.0.0',
 *             family: 'IPv4',
 *             mac: '00:00:00:00:00:00',
 *             internal: true },
 *           { address: 'fe80::1',
 *             netmask: 'ffff:ffff:ffff:ffff::',
 *             family: 'IPv6',
 *             mac: '00:00:00:00:00:00',
 *             scopeid: 1,
 *             internal: true } ],
 *        en0:
 *         [ { address: 'fe80::a299:9bff:fe17:766d',
 *             netmask: 'ffff:ffff:ffff:ffff::',
 *             family: 'IPv6',
 *             mac: 'a0:99:9b:17:76:6d',
 *             scopeid: 4,
 *             internal: false },
 *           { address: '10.0.1.22',
 *             netmask: '255.255.255.0',
 *             family: 'IPv4',
 *             mac: 'a0:99:9b:17:76:6d',
 *             internal: false } ],
 *        awdl0:
 *         [ { address: 'fe80::48a8:37ff:fe34:aaef',
 *             netmask: 'ffff:ffff:ffff:ffff::',
 *             family: 'IPv6',
 *             mac: '4a:a8:37:34:aa:ef',
 *             scopeid: 8,
 *             internal: false } ],
 *        vnic0:
 *         [ { address: '10.211.55.2',
 *             netmask: '255.255.255.0',
 *             family: 'IPv4',
 *             mac: '00:1c:42:00:00:08',
 *             internal: false } ],
 *        vnic1:
 *         [ { address: '10.37.129.2',
 *             netmask: '255.255.255.0',
 *             family: 'IPv4',
 *             mac: '00:1c:42:00:00:09',
 *             internal: false } ] }
 *
 *    - Output:
 *
 *         [
 *          '0.0.0.0',
 *          '::1',
 *          '127.0.0.1',
 *          'fe80::1',
 *          '10.0.1.22',
 *          'fe80::48a8:37ff:fe34:aaef',
 *          '10.211.55.2',
 *          '10.37.129.2'
 *         ]
 *
 *     Note we export this so we can use it in our tests, otherwise this API is private
 */
exports._defaultHosts = (function () {
    var interfaces = {};
    try {
        interfaces = os.networkInterfaces();
    } catch (e) {
        // As of October 2016, Windows Subsystem for Linux (WSL) does not support
        // the os.networkInterfaces() call and throws instead. For this platform,
        // assume 0.0.0.0 as the only address
        //
        // - https://github.com/Microsoft/BashOnWindows/issues/468
        //
        // - Workaround is a mix of good work from the community:
        //   - https://github.com/indexzero/node-portfinder/commit/8d7e30a648ff5034186551fa8a6652669dec2f2f
        //   - https://github.com/yarnpkg/yarn/pull/772/files
        if (e.syscall === 'uv_interface_addresses') {
            // swallow error because we're just going to use defaults
            // documented @ https://github.com/nodejs/node/blob/4b65a65e75f48ff447cabd5500ce115fb5ad4c57/doc/api/net.md#L231
        } else {
            throw e;
        }
    }

    var interfaceNames = Object.keys(interfaces),
        hiddenButImportantHost = '0.0.0.0', // !important - dont remove, hence the naming :)
        results = [hiddenButImportantHost];
    for (var i = 0; i < interfaceNames.length; i++) {
        var _interface = interfaces[interfaceNames[i]];
        for (var j = 0; j < _interface.length; j++) {
            var curr = _interface[j];
            results.push(curr.address);
        }
    }

    return results;
}());