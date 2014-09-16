# Dockerfile for AT&T nanocubes
FROM ubuntu:14.04
MAINTAINER Brad Dixon https://hub.docker.com/u/rbdixon/

# Proxy
ENV http_proxy http://one.proxy.att.com:8080
ENV https_proxy https://one.proxy.att.com:8080

# Build Requirements
RUN apt-get update && apt-get -y install automake libtool zlib1g-dev libboost-dev libboost-test-dev libboost-system-dev libboost-thread-dev build-essential wget unzip python-pip python-dev gfortran nodejs npm
RUN pip install argparse numpy pandas

# Setup nanocube user and passwd
RUN useradd -m nanocube

# Source
ADD . /home/nanocube
RUN chown -R nanocube:nanocube /home/nanocube

# Build
USER nanocube
WORKDIR /home/nanocube
RUN ./bootstrap
RUN CXX=g++-4.8 ./configure
RUN make

# Final Setup
EXPOSE 8000 29512
ENV NANOCUBE_BIN /home/nanocube/src
ENV NANOCUBE_WEB /home/nanocube/web
ENV HOME /home/nanocube
USER nanocube 
WORKDIR /home/nanocube/scripts
RUN npm install
USER root
CMD nodejs /home/nanocube/scripts/server.js