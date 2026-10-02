#!/bin/bash
# Remove do HISTÓRICO do git arquivos sensíveis/indevidos (exige force-push combinado com a equipe).
#  - 4.aab                      → app de terceiros (J2S Obras) com planilha de folha de pagamento
#  - android/keystore.properties → senha da chave de upload
#  - j2s-horas.keystore          → keystore de outro projeto
#  - bundletool.jar, node_modules/, dist/ → artefatos (o repositório fica muito menor)
#
# Uso (em um CLONE NOVO, sem alterações pendentes):
#   pip install git-filter-repo
#   git clone --mirror https://github.com/mkorpinfra-star/Control-APP.git && cd Control-APP.git
#   bash ../scripts/limpar-historico.sh
#   git push --force --mirror origin
# Depois: todos apagam seus clones antigos e clonam de novo. Abra um chamado no GitHub Support
# para limpar caches de PRs/forks, se o repositório for ou já tiver sido público.
set -euo pipefail
command -v git-filter-repo >/dev/null || { echo "instale: pip install git-filter-repo"; exit 1; }
git filter-repo --force --invert-paths \
  --path 4.aab \
  --path android/keystore.properties \
  --path j2s-horas.keystore \
  --path bundletool.jar \
  --path node_modules/ \
  --path dist/
echo "Histórico reescrito. Confira com: git log --all --oneline -- 4.aab android/keystore.properties  (deve vir vazio)"
