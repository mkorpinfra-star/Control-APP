#!/bin/bash
# Script para login automático no EAS

# Instalar expect se necessário (para automação de inputs)
echo "Fazendo login no EAS..."

# Login usando variáveis de ambiente
export EXPO_USERNAME="guilherme96v@gmail.com"
export EXPO_PASSWORD="legolego0304"

# Tentar login
eas login --username "$EXPO_USERNAME" --password "$EXPO_PASSWORD"
