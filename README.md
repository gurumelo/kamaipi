# nodekami

En proceso

Esto es una instalación de un servidor kamailio(enrutador voip) con una aplicación node.js 
para la creación de teléfonos(extensiones) de manera abierta. Los servidores kamailio entre sí, pueden federar, y 
llamarse, las diferentes personas de diferentes servidores, entre ellas. Una red de telefonía descentralizada
sólo con software libre.

Nodekamis funcionando:

1. https://voip.elbinario.net

2. ...

![](http://i.imgur.com/7CqKYPo.png)

Teníamos 2 euros y pico para un vps con **Debian**.

```
Bienvenido a xxxxxx
su nuevo servidor virtual es xx.xx.xx.xx
su contrasena de root es xXxXxxxXxXXXX
```
```
ssh root@xx.xx.xx.xx
```
```
passwd && apt-get update && apt-get upgrade && apt-get install fail2ban git
```

Creamos usuario de sistema con home, posicionar y clonar
```
useradd -s /usr/sbin/nologin -r -m nodekami
cd /home/nodekami
git clone https://github.com/gurumelo/nodekami && cp -r nodekami/* . && rm -rf nodekami/
chown -r nodekami:nodekami *
```

Luego volvemos sobre ello.


## Instalación de Kamailio

Repositorios e instalación de paquetes necesarios

```
# Importamos llaves del repositorio de kamailio
apt-key adv --recv-keys --keyserver keyserver.ubuntu.com 0xfb40d3e6508ea4c8

# Añadimos repositorios
echo "deb http://deb.kamailio.org/kamailio jessie main" >> /etc/apt/sources.list
echo "deb-src http://deb.kamailio.org/kamailio jessie main" >> /etc/apt/sources.list

# Actualizamos repositorios
apt-get update

# Instalamos paquetería
apt-get install kamailio kamailio-sqlite-modules kamailio-tls-modules rtpproxy sqlite3 openssl gnutls-bin
```

**Importante**

```
#Añadimos al grupo rtpproxy, el usuario kamailio, para que pueda usar el socket
usermod -a -G rtpproxy kamailio
```

####Modificación de archivos de configuración de kamailio

**/etc/default/kamailio**

```
nano /etc/default/kamailio 
# descomentamos, cambiamos #RUN_KAMAILIO=yes
# por RUN_KAMAILIO=yes
```

**/etc/kamailio/kamctlrc**

```
nano /etc/kamailio/kamctlrc
# cambiamos # SIP_DOMAIN=kamailio.org
# por SIP_DOMAIN=AQUÍTUDOMINIO.net

# cambiamos # DBENGINE=MYSQL
# por DBENGINE=SQLITE

# cambiamos # DB_PATH="/usr/local/etc/kamailio/dbtext"
# por DB_PATH="/home/nodekami/app/kamailio.sqlite"

# descomentamos, cambiamos # STORE_PLAINTEXT_PW=0
# por STORE_PLAINTEXT_PW=0
```

**/etc/kamailio/kamailio.cfg**

```
cp /etc/kamailio/kamailio.cfg /etc/kamailio/kamailio.cfg.BAK
nano /etc/kamailio/kamailio.cfg

# tras #!KAMAILIO añadir carga de módulos (con las almohadillas incluidas)
```

```
#!define WITH_SQLITE
#!define WITH_AUTH
#!define WITH_USRLOCDB
#!define WITH_NAT
#!define WITH_TLS
```

```
# Descomentar y sustituir #alias="sip.mydomain.com"
# Por alias="AQUÍTUDOMINIO.net"


# Sustituir modparam("rtpproxy", "rtpproxy_sock", "udp:127.0.0.1:7722")
# Por modparam("rtpproxy", "rtpproxy_sock", "unix:/var/run/rtpproxy/rtpproxy.sock")


# Sustituir modparam("auth_db", "calculate_ha1", yes)
# Por modparam("auth_db", "calculate_ha1", 0)

# Sustituir modparam("auth_db", "password_column", "password")
# Por modparam("auth_db", "password_column", "ha1")

# Justo después de loadmodule "acc.so", añadimos (almohadillas inclusive):
```

```
#!ifdef WITH_SQLITE
loadmodule "db_sqlite.so"
#!endif
```

```
# Justo después de # ----------------- setting module-specific parameters ---------------
 , se añade (almohadillas inclusive):
```

```
#!ifdef WITH_SQLITE
modparam("auth_db", "db_url", "sqlite:///home/nodekami/app/kamailio.sqlite")
#!define DBURL "sqlite:///home/nodekami/app/kamailio.sqlite"
#!endif
```

**/etc/kamailio/tls.cfg**

```
mv /etc/kamailio/tls.cfg /etc/kamailio/tls.cfg.bak
nano /etc/kamailio/tls.cfg
```

Compuesto por:

```
[server:default]
method = TLSv1
verify_certificate = no
require_certificate = no
private_key = /etc/kamailio/kamailio-cert.key
certificate = /etc/kamailio/kamailio-cert.crt

[client:default]
verify_certificate = no
require_certificate = no
```

Guardamos archivo

Creación de certificados:

```
cd /etc/kamailio
nano tls.template
# con el siguiente contenido
cn = "AQUÍTUDOMINIO.net"
expiration_days = 1984
# Guardar
# Crear certificados
certtool -p --bits 4096 --template=tls.template --outfile kamailio-cert.key
certtool -s --load-privkey=kamailio-cert.key --bits 4096 --template=tls.template --outfile kamailio-cert.crt
# Establecer permisos
chmod 440 kamailio-cert*
chown root:kamailio kamailio-cert.*
```

**Lanzar la creación de la base de datos**

```
kamdbctl create
# Responder a todo que sí, sí, sí...
```

**Arrancar**

```
service kamailio start
```

##Instalamos nginx y node

```
apt-get install nginx-extras curl
```

```
curl -sL https://deb.nodesource.com/setup_4.x | bash -
apt-get install nodejs
```

Instalamos las dependencias de la aplicación

```
cd /home/nodekami/app
npm install
```

Generación de llaves para la aplicación

```
openssl genrsa -out rsaprivada.pem 2048
openssl rsa -pubout -in rsaprivada.pem -out rsapublica.pem
cat rsapublica.pem
# Copiamos la llave pública y sin retornos de carro la pegamos en
nano public/js/index.js
# La línea 23
# crypt.setKey('-----BEGIN PUBLIC KEY-----BORRAESTOypegaAQUítuCLAVEpública-----END PUBLIC KEY-----');
# Borramos todo lo que contienen las comillas y. Pegamos la llave pública generada dentro de las comillas.
# Eliminando!!! los retornos de carro. Por ejemplo:
# crypt.setKey('-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx1c8pWiTjG9iJ6Y/L3yvF/r4y2roy817aSIjckfbOcAWvoaZeoW0XBtWyusTCqnvkePEplUj0+bKuOakpaQlIsaGfc209zdTu2S9hrOyi4ezwhlHg+9Le4+KdvWaxhflnxKx8oaLK/FDQQDYug7vdRaY87Q694GlBoWejkvpcxfKYHFHwdcK8KQ1TSBRfrKhODT6gliVMuqtbhPwOpfYoxtNOs+8PxbGORwVjwb6C1BDSD3xeDKosD34Cm4es87SRyedOoi6uoeYBNmFODU73yWDWS01hTuNjCnfxsP5eEd3mNtYaBL/ioJAvtMqa/6ehyEsSeMG2rW+5Vsyd7rzaQIDAQAB-----END PUBLIC KEY-----');
```

Configurar el json de la aplicación
```
nano /home/nodekami/app/confi.json

{
        "dominio": "AQUÍTUDOMINIO.net",
        "ip": "127.0.0.1",
        "puerto": 3000,
        "secreto": "PONAQUIUNACLAVE",
        "bd": "kamailio.sqlite"
}

#Sustituir dominio, secreto(invéntate alguna clave).
```



**Permisos**

```
cd /home/nodekami/app
chown -R nodekami:nodekami *
chown nodekami:kamailio kamailio.sqlite
chmod 660 kamailio.sqlite
```

## Demonizando la aplicación node y configurando nginx

```
nano /etc/systemd/system/nodekami.service
```

Pegamos dentro
```
[Service]
WorkingDirectory=/home/nodekami/app
ExecStart=/usr/bin/node index.js
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=nodekami
User=nodekami
Group=nodekami

[Install]
WantedBy=multi-user.target
```

Habilitamos servicio y lo arrancamos
```
systemctl enable nodekami
systemctl start nodekami
```

Habilitamos sitio para nginx

```
nano /etc/nginx/sites-available/nodekami
```

Pegamos dentro
```
server {
        listen 80;
        server_name AQUÍTUHOST.net;

        location / {
                proxy_pass http://127.0.0.1:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
}
```

Guardamos. Enlazamos
```
ln -s /etc/nginx/sites-available/nodekami /etc/nginx/sites-enabled/nodekami
service nginx restart
```

Y probamos:
http://aquítudominio.net
