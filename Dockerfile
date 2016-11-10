FROM debian:jessie

WORKDIR /opt
ENV DOMAIN=kamailio.org


RUN apt-get update && apt-get upgrade -y && apt-get install fail2ban git -y
RUN git clone https://github.com/gurumelo/nodekami && cp -r nodekami/* . && rm -rf nodekami/

RUN apt-key adv --recv-keys --keyserver keyserver.ubuntu.com 0xfb40d3e6508ea4c8

RUN echo "deb http://deb.kamailio.org/kamailio jessie main" >> /etc/apt/sources.list
RUN echo "deb-src http://deb.kamailio.org/kamailio jessie main" >> /etc/apt/sources.list

RUN apt-get update

RUN apt-get install kamailio kamailio-sqlite-modules kamailio-tls-modules rtpproxy sqlite3 openssl gnutls-bin -y

COPY etc/kamailio /etc/default/kamailio
COPY etc/tls.cfg /etc/kamailio/tls.cfg

RUN  sed s/CUSTOM_DOMAIN/${INCLUDE_TEST}/g etc/kamailio.cfg > /etc/kamailio/kamailio.cfg
RUN sed s/CUSTOM_DOMAIN/${INCLUDE_TEST}/g etc/kamctlrc > /etc/kamailio/kamctlrc

RUN kamdbctl create

RUN service kamailio start
