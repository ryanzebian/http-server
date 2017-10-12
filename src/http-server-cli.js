// #!/usr/bin/env node

'use strict';
// var os = require('os');
// var network = os.networkInterfaces()
var colors = require('./lib/colors/colors');
var argv = require('minimist')(process.argv.slice(2));
var portfinder= {};
if (argv.h || argv.help) {
    console.log([
        'usage: http-server [path] [optons]',
        '',
        'options:',
        '  -p           Port to use [8080]',
        '  -a           Address to use [0.0.0.0]',
        '  -d           Show directory listings [true]',
        '  -i           Display autoIndex [true]',
        '  -g --gzip    Serve gzip files when possible [false]',
        '  -e --ext     Default file extension if none supplied [none]',
        '  -s --silent  Suppress log messages from output',
        '  --cors[=headers]   Enable CORS via the "Access-Control-Allow-Origin" header',
        '                     Optionally provide CORS headers list separated by commas',
        '  -o [path]    Open browser window after starting the server',
        '  -c           Cache time (max-age) in seconds [3600], e.g. -c10 for 10 seconds.',
        '               To disable caching, use -c-1.',
        '  -U --utc     Use UTC time format in log messages.',
        '',
        '  -P --proxy   Fallback proxy if the request cannot be resolved. e.g.: http://someurl.com',
        '',
        '  -S --ssl     Enable https.',
        '  -C --cert    Path to ssl cert file (default: cert.pem).',
        '  -K --key     Path to ssl key file (default: key.pem).',
        '',
        '  -r --robots  Respond to /robots.txt [User-agent: *\\nDisallow: /]',
        '  --no-dotfiles  Do not show dotfiles',
        '  -h --help    Print this list and exit.'
    ].join('\n'));
    process.exit();
}

var port = argv.p || parseInt(process.env.PORT, 10),
    host = argv.a || '0.0.0.0',
    ssl = !!argv.S || !!argv.ssl,
    proxy = argv.P || argv.proxy,
    utc = argv.U || argv.utc,
    logger;

    if (!port) {
        portfinder.basePort = 8080;
        portfinder.getPort(function (err, port) {
          if (err) { throw err; }
          listen(port);
        });
      }
      else {
        listen(port);
      }


      if (process.platform === 'win32') {
        require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        }).on('SIGINT', function () {
          process.emit('SIGINT');
        });
      }
      
      process.on('SIGINT', function () {
        logger.info(colors.red('http-server stopped.'));
        process.exit();
      });
      
      process.on('SIGTERM', function () {
        logger.info(colors.red('http-server stopped.'));
        process.exit();
      });

      console.log('hello world!');