#!/bin/bash
# ZERA o histórico do repositório: o GitHub passa a ter UM único commit com o app MKORP limpo.
# Remove de vez tudo do projeto anterior (APKs/AABs, keystores, .env, credenciais, planilhas)
# que estava nos 100+ commits antigos. É irreversível no remoto — faça um backup antes.
#
# Uso (no clone onde está a branch `app-zerado`, ou após importar o bundle):
#   git clone --mirror https://github.com/mkorpinfra-star/Control-APP.git backup-control-app.git   # backup (guarde offline)
#   bash scripts/zerar-historico.sh
#
# Depois:
#   - todos apagam os clones antigos e clonam de novo;
#   - se o repositório for ou já foi público/forkado: peça ao GitHub Support a remoção de
#     commits em cache (https://support.github.com → "Remove sensitive data").
set -euo pipefail
git rev-parse --verify app-zerado >/dev/null || { echo "branch app-zerado não encontrada"; exit 1; }
[ "$(git rev-list --count app-zerado)" = "1" ] || { echo "app-zerado deveria ter 1 commit"; exit 1; }

echo "Isto vai SUBSTITUIR a main remota e apagar as demais branches remotas. Digite ZERAR para continuar:"
read -r ok; [ "$ok" = "ZERAR" ] || { echo "cancelado"; exit 1; }

git push --force origin app-zerado:main
for b in $(git ls-remote --heads origin | awk '{print $2}' | sed 's#refs/heads/##' | grep -vx main); do
  git push origin --delete "$b"
done
for t in $(git ls-remote --tags origin | awk '{print $2}' | grep -v '\^{}' | sed 's#refs/tags/##'); do
  git push origin --delete "refs/tags/$t"
done
echo "Pronto: o remoto tem só a main com 1 commit. Rode 'git fetch --prune' e recrie os clones."
