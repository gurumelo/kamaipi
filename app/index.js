var confi 	= require('./confi.json');
var express 	= require('express');
var session 	= require('express-session');
var bodyParser 	= require('body-parser');
var validator 	= require('validator');
var fs 		= require('fs');
var ursa 	= require('ursa');
var key 	= ursa.createPrivateKey(fs.readFileSync('./rsaprivada.pem'));
var sqlite3 	= require('sqlite3');
var crypto 	= require('crypto');
var bandera	= 0;
var app 	= express();

// Templates/vistas ejs
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Servir directorio public
app.use(express.static('./public'));

// Sesiones
app.use(session({
	name: '',
	secret: confi.secreto,
	resave: false,
	saveUninitialized: false
}));

// Body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


// Función SQLITE
var sentencia = function(lacontra, retrollamada) {
	bandera = 1;
	var db = new sqlite3.Database(confi.bd);

	db.get("SELECT MAX(id) AS id FROM subscriber", function(err, row) {
        	if (row.id == null) {
                	var id = 1;
	        } else {
        	        var id = row.id + 1;
	        }
	        var aha1 = id +':'+ confi.dominio +':'+ lacontra;
	        var aha1b = id +'@'+ confi.dominio +':'+ confi.dominio +':'+ lacontra;
	        var ha1 = crypto.createHash('md5').update(aha1).digest('hex');
	        var ha1b = crypto.createHash('md5').update(aha1b).digest('hex');

		db.run("INSERT INTO subscriber(username, domain, ha1, ha1b) VALUES (?, ?, ?, ?)", [ id, confi.dominio, ha1, ha1b ], function(error) {
			bandera = 0;
			retrollamada({ 'estado': 1, 'n': id });
	        });
	});


	db.close();

};

// banderas
var vamosalla = function(lacontra,retrollamada) {
        if (bandera == 0) {
                sentencia(lacontra,retrollamada);
        } else {
                setTimeout(vamosalla, 50);
        }
};



// Sirve index
app.get('/', function(req, res) {
	//Sesión
	sess = req.session;

	// Creamos una variable con una cadena alfanumérica aleatoria.
	var aleatori = Math.random().toString(36).slice(2);

	//Creamos variable de sesión
	sess.aleatori = aleatori;

	// Se renderiza la vista enviando variable	
	res.render('index', {
		aleatori: aleatori
	});
});


// Procesa alta
var cosa = { 'estado': 0 };

app.post('/t', function(req, res) {
	if ( (Object.keys(req.body).length == 3) && (validator.isBase64(req.body.contrasena)) && (validator.isBase64(req.body.paso)) && (validator.isBase64(req.body.aleatori)) ) { 
		var paso = key.decrypt(req.body.paso,'base64', 'utf8', ursa.RSA_PKCS1_PADDING);
		if ( validator.isNull(paso) ) {
			// Puede que no sea un bot
			var aleatori = key.decrypt(req.body.aleatori,'base64', 'utf8', ursa.RSA_PKCS1_PADDING);
			//descifrar aleatori, comprobar que es alfanumérico y comprobar que es igual a la session.
			if ( validator.isAlphanumeric(aleatori) ) {
				sess = req.session;
				
				if (sess.aleatori && sess.aleatori == aleatori) {
					var contrasena = key.decrypt(req.body.contrasena,'base64', 'utf8', ursa.RSA_PKCS1_PADDING);
					//mayor a 1 y menor a 25
					if ( validator.isLength(contrasena, 1, 25) ) {
						//SQLITE
						vamosalla(contrasena, function(numerito){ 
							res.send(numerito); 
						});						

						req.session.destroy();				

					}
					else {
						res.send(cosa);
					}
				}
				else {
					res.send(cosa);
				}

			}
			else {
				res.send(cosa);
			}
			
		}
		else {
			res.send(cosa);		
		}


	}
});

// A funcionar
app.listen(confi.puerto, confi.ip);
