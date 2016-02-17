var http = require( "http" );
var tinify = require( "tinify" );
var fs = require( "fs" );
var config = require( "./config.js" );

var mainDir = "./img/";
var inDir = "in";
var outDir = "out";
var dirsToRecurseArray = [];

var server = http.createServer( function( req, res )
{
    console.log( "_____________________________________" );
    console.log( "_______________TinyPng_______________" );
    console.log( "_____________________________________" );

    // If request is for favIcon don't do anything else
    if( req.url === "/favicon.ico" ) return;

    // Provide tinify with dev key
    tinify.key = config.tinyKey;

    checkInDirExists();

    processDirectory( "" );
});
server.listen( config.port );


function processDirectory( dir )
{
    var completedFiles = [];
    var fullInDir = ( dir === "" ) ? ( mainDir + inDir + "/" + dir ) : ( mainDir + inDir + "/" + dir + "/" );
    var fullOutDir = ( dir === "" ) ? ( mainDir + outDir + "/" + dir ) : ( mainDir + outDir + "/" + dir + "/" );
    createDirIfNotExists( fullOutDir );

    fs.readdir( fullInDir, ( err, files ) =>
    {
        if( err )
        {
            console.log( err.message );
            exit();
        }

        removeDSStore( files );
        files = removeNonPNGorJPEG( files );
        if( files.length === 0 )
        {
            console.log( "There are no files in the " + fullInDir + " folder" );
            exit();
        }

        checkForDirectoriesToRecurse( files, fullInDir );

        // If Just contains directories, start recursing
        if( files.length === 0 )
        {
            finishedDirectory( files, completedFiles );
            return;
        }

        for( var i = 0; i < files.length; i++ )
        {
            // CLOSURE
            ( function( file ) {
                var source = tinify.fromFile( fullInDir + file );
                source.toFile( fullOutDir + file, ( err ) =>
                {
                    if( err )
                    {
                        console.log( err );
                        console.log( err.message );
                        exit();
                    }

                    completedFiles.push( file );
                    console.log( file + " - Compressed" );

                    finishedDirectory( files, completedFiles );
                } );
            } )( files[ i ] );
        }
    } );
}

function removeNonPNGorJPEG( files )
{
    var filesClone = [];
    for( var i = 0; i < files.length; i++ )
    {
        var fileSplit = files[ i ].split( "." );
        var ext = fileSplit[ fileSplit.length - 1 ];
        if( ( ext === "png" ) || ( ext === "jpg" ) || ( ext === "jpeg" ) )
        {
            filesClone.push( files[ i ] );
        }
    }
    return filesClone;
}

function finishedDirectory( files, completedFiles )
{
    if( completedFiles.length === files.length )
    {
        if( dirsToRecurseArray.length )
        {
            processDirectory( dirsToRecurseArray.splice( 0, 1 )[ 0 ] );
        }
        else
        {
            exit();
        }
    }
}

function exit( errCode )
{
    console.log( "_____________________________________" );
    process.exit( 0 );
}

function checkForDirectoriesToRecurse( files, fullInDir )
{
    // Check if any folder recursion required
    var currentInc = 0;
    var filesLength = files.length;
    for( var j = 0; j < filesLength; j++ )
    {
        if( fs.lstatSync( fullInDir + files[ currentInc ] ).isDirectory() === true )
        {
            dirsToRecurseArray.push( files.splice( currentInc, 1 )[ 0 ] );
        }
        else
        {
            currentInc++;
        }
    }
}

function checkInDirExists()
{
    // Check if inDir exists
    if( !fs.existsSync( mainDir + inDir ) )
    {
        console.log( mainDir + inDir + " folder doesn't exist!" );
        exit();
    }
}

function createDirIfNotExists( dir )
{
    if( !fs.existsSync( dir ) )
    {
        fs.mkdirSync( dir );
    }
}

function removeDSStore( files )
{
    for( var i = 0; i < files.length; i++ )
    {
        if( files[ i ] === ".DS_Store" )
        {
            files.splice( i, 1 );
        }
    }
}




// CALL SELF
var options = {
  host: config.server,
  path: '/',
  //since we are listening on a custom port, we need to specify it by hand
  port: config.port,
  //This is what changes the request to a POST request
  method: 'POST'
};
callback = function(response) {
  var str = ''
  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    console.log(str);
  });
}
var forceReq = http.request( options, callback );
forceReq.write( "run it!" );
forceReq.end();
