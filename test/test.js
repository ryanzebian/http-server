var assert = require('assert');
var vows = require('vows');
// var httpServer = require('../bin/http-server');

vows.describe('cli commands').addBatch({
    'cli help command': {
        topic: () => {
            return 'test setup';
        },

        'it should initialize successfully': (setupName)=>{
            assert.equal(setupName, 'test setup');
        }
    },
    'test color lib':{
        topic: () => {
            return require('../src/lib/colors/colors');
        },
        'it should not throw an error': (colors)=>{
            console.log('hello world');
            console.log(colors.red('hello world'));
            console.log(colors.cyan('hello world'));
            console.log(colors.yellow('hello world'));
            console.log(colors.green('hello world'));
            assert.ok(true);
        }
    }
}).export(module);