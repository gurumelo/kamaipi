# nodekami

En proceso

Esto es una instalación de un servidor kamailio(enrutador voip) con una aplicación node.js 
para la creación de teléfonos(extensiones) de manera abierta. Los servidores kamailio entre sí, pueden federar, y 
llamarse, las diferentes personas de diferentes servidores, entre ellas. Una red de telefonía descentralizada
sólo con software libre.

Nodekamis funcionando:

1. https://voip.elbinario.net

2. ...


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

Instalación de Kamailio








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

