#!/usr/bin/env node
const optparse = require('../optparse')
const { port } = optparse(process.argv)

require('../').start({ port })
