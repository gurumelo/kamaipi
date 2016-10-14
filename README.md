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

##Instalación de Kamailio

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

******Importante******

```
#Añadimos al grupo rtpproxy, el usuario kamailio, para que pueda usar el socket
usermod -a -G rtpproxy kamailio
```

####Modificación de archivos de configuración de kamailio

**/etc/default/kamailio**

```
# nano /etc/default/kamailio 
# descomentamos, cambiamos #RUN_KAMAILIO=yes
# por RUN_KAMAILIO=yes
```




Instalamos nginx y node










---------------------------------------------------------------
las llaves
     

openssl genrsa -out rsaprivada.pem 2048
openssl rsa -pubout -in rsaprivada.pem -out rsapublica.pem
cat rsapublica.pem
chmod 400 rsaprivada.pem
pegar la publica en jsencrypt sin retornos de carro



/etc/systemd/system# more nodekami.service 
[Service]
WorkingDirectory=/home/nodekami/app
ExecStart=/usr/local/bin/node index.js
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=nodekami
User=nodekami
Group=nodekami

[Install]
WantedBy=multi-user.target





  systemctl enable nodekami
  systemctl start nodekami
  
  
  
  
  server {
        listen 80;
        server_name **AQUÍTUHOST.net**;

        location / {
                proxy_pass http://127.0.0.1:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
}

