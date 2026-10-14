# Painel de acompanhamento do SIGA

Página que a APAE usa para acompanhar o projeto SIGA (Sistema Integrado de Gestão de Agendas): fases, dias trabalhados, aprovações e os botões dos checklists de validação.

- **Endereço:** <https://vcj81.github.io/apae-siga-status/>
- **Fonte oficial:** `apps/painel/` no repositório privado `vcj81/apae-siga`. Até 13/10/2026, a fonte era o Artifact do claude.ai (`apps/docs/artifact-status-projeto.html`, mantido no histórico do git).
- **Publicação:** o workflow `.github/workflows/publicar-painel.yml` copia **só esta pasta** para o repositório público `vcj81/apae-siga-status` a cada push na `main` que mexa aqui. Esse repositório público serve o site pelo GitHub Pages.
- **Só durante o desenvolvimento.** O painel não faz parte do sistema SIGA e não entra no deploy (`apps/api` + `apps/web`, ver ADR-007).

> Tudo nesta pasta fica **público**. Nunca coloque aqui dados de alunos, nomes de famílias ou qualquer coisa vinda da grade real.

## Arquivos

| Arquivo | Papel |
|---|---|
| `index.html` | O painel inteiro: conteúdo, estilo e scripts num arquivo só. |
| `manifest.webmanifest` | Manifesto do PWA: nome, ícones, cores, `display: standalone`. |
| `sw.js` | Service worker: deixa o painel instalável e abrindo offline. |
| `icons/` | Ícone da marca em SVG, 192 e 512 px. |
| `.nojekyll` | Faz o GitHub Pages servir os arquivos como estão, sem Jekyll. |

## Cor dos botões "Responder checklist"

Ao abrir, o painel consulta `<URL do Web App>/exec?status=1` (`apps/checklist-gas`) e pinta cada botão:

| Cor | Estado | Significa |
|---|---|---|
| Vermelho | `nunca` | Ninguém abriu o checklist ainda |
| Laranja | `aberto` | O checklist foi aberto, mas as respostas não foram enviadas |
| Verde | `enviado` | As respostas foram enviadas. O texto muda para "Responder checklist novamente". |

Se a consulta falhar, o botão fica no âmbar padrão e o link continua funcionando. O `data-checklist` de cada botão (`fase3`, `fase4`, `fase5`, `fase6`) precisa bater com a chave em `CHECKLISTS` no `Code.gs`.

## Atualizar o painel

Edite `index.html`, faça o commit e dê push na `main` do `apae-siga`. O workflow publica, e o site atualiza em cerca de 1 minuto. Se mudar a lista de arquivos estáticos, suba a `VERSAO` no `sw.js`.

Para testar localmente: `python -m http.server 8080 --directory apps/painel` e abra <http://localhost:8080>.

## Configuração inicial (uma vez)

1. Com a conta **vcj81**, crie o repositório **público** `apae-siga-status`, vazio.
2. Gere uma chave só para o deploy (fora do repositório):
   ```
   ssh-keygen -t ed25519 -C "publicar-painel" -f painel_deploy -N ""
   ```
3. No `apae-siga-status`, vá em **Settings → Deploy keys → Add deploy key**. Cole o conteúdo de `painel_deploy.pub` e marque **Allow write access**.
4. No `apae-siga`, vá em **Settings → Secrets and variables → Actions → New repository secret**. Use o nome `PAINEL_DEPLOY_KEY` e cole o conteúdo de `painel_deploy`, a chave privada.
5. Apague os dois arquivos `painel_deploy*` do computador.
6. Faça push no `apae-siga`, ou rode o workflow em **Actions → Publicar painel → Run workflow**.
7. No `apae-siga-status`, vá em **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**.
8. Abra o endereço no Chrome ou no Edge e confira em **DevTools → Application → Manifest** se não aparece nenhum erro de instalação.
