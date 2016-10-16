#!/usr/bin/env babel-node
require('./helper');
let path = require('path');
let fs = require('fs').promise;
let asyncHandlerPlugin = require('hapi-async-handler')
let Hapi = require('hapi')

 //let cat = require('./cat')
// const rm = require('./rm')
// const mkdir = require('./mkdir')
// const touch = require('./touch')

function getLocalFilePathFromRequest(request) {
  let pathName = ""
  try{
     pathName = path.join(__dirname, 'files', request.params.file)

  }catch(e){
    console.log(e)
  }
  return pathName
}

async function cat (fileName) {
  console.log('Executing cat function...for '+fileName);
  try {
    return await fs.readFile(fileName,'utf8');
  }
  catch (err) { console.error( err ) }
}
async function readHandler(request, reply) {
  let filePath = getLocalFilePathFromRequest(request)
  console.log(`Reading ${filePath}`);


 let data = await cat(filePath);
  console.log(data);

  reply(data)
}

async function createHandler(request, reply) {
  /* eslint no-unused-expressions: 0 */
  const filePath = getLocalFilePathFromRequest(request)

  console.log(`Creating ${filePath}`)

  const stat = await fs.stat(filePath)
  await stat.isDirectory() ? mkdir(filePath) : touch(filePath)
  reply()
}

async function updateHandler(request, reply) {
  const filePath = getLocalFilePathFromRequest(request)

  console.log(`Updating ${filePath}`)
  await fs.writeFile(filePath, request.payload)
  reply()
}

async function deleteHandler(request, reply) {
  const filePath = getLocalFilePathFromRequest(request)

  console.log(`Deleting ${filePath}`)
  await rm(filePath)
  reply()
}

async function main() {
  let port = 8000
  let server = new Hapi.Server({
    debug: {
      request: ['errors']
    }
  })
  server.register(asyncHandlerPlugin)

  server.connection({ port:port })

  server.route([
    // READ
    {
      method: 'GET',
      path: '/{file*}',
      handler: {
        async: readHandler
      }
    },
    // CREATE
    {
      method: 'PUT',
      path: '/{file*}',
      handler: {
        async: createHandler
      }
    },
    // UPDATE
    {
      method: 'POST',
      path: '/{file*}',
      handler: {
        async: updateHandler
      }
    },
    // DELETE
    {
      method: 'DELETE',
      path: '/{file*}',
      handler: {
        async: deleteHandler
      }
    }
  ])

  await server.start()
  console.log(`LISTENING @ http://127.0.0.1:${port}`)
}

main()
