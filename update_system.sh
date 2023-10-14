#!/bin/bash

# Executa o comando para parar os containers
sudo docker compose down

# Atualiza o projeto com o git
git pull

# Executa o comando para construir as imagens
sudo docker compose build

# Executa o comando para iniciar os containers em background
sudo docker compose up -d
