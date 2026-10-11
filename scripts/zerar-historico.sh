#!/bin/bash
# ZERA o histórico do repositório: o GitHub passa a ter UM único commit com o app MKORP limpo.
# Remove de vez tudo do projeto anterior (APKs/AABs, keystores, .env, credenciais, planilhas)
# que estava nos 100+ commits antigos. É irreversível no remoto — faça um backup antes.
#
# Uso (num clone que tenha a branch qa/auditoria-play-store — ex.: importada do bundle):
#   git clone --mirror https://github.com/mkorpinfra-star/Control-APP.git backup-control-app.git   # backup (guarde offline)
#   bash scripts/zerar-historico.sh
#
# Depois:
#   - todos apagam os clones antigos e clonam de novo;
#   - se o repositório for ou já foi público/forkado: peça ao GitHub Support a remoção de
#     commits em cache (https://support.github.com → "Remove sensitive data").
set -euo pipefail
# Cria a branch `app-zerado` com UM commit, sem pais, a partir do estado atual da branch limpa
ORIGEM=${ORIGEM:-qa/auditoria-play-store}
if ! git rev-parse --verify -q app-zerado >/dev/null; then
  SHA=$(git commit-tree "$ORIGEM^{tree}" -m "MKORP Control — versão inicial")
  git branch app-zerado "$SHA"
fi
[ "$(git rev-list --count app-zerado)" = "1" ] || { echo "app-zerado deveria ter 1 commit"; exit 1; }
if git grep -Iil "j2s" app-zerado -- . ':!package-lock.json' ':!scripts/zerar-historico.sh' | grep -q .; then
  echo "Ainda há referência ao projeto anterior na árvore — abortado"; exit 1
fi

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
