# Hermes Field Guide

An independent, practical guide to Hermes Agent for technically curious people with some computer experience and little agent-infrastructure experience.

The guide is written for Javier's own learning first, then shared with classmates as an early reader test and possible ICP signal. It is not official Nous Research documentation.

## Current status

- Version: `0.1`
- Reviewed against: official Hermes documentation index on 2026-09-13
- Public site: https://launch.technoir.cloud/
- Official source of truth: https://hermes-agent.nousresearch.com/docs/
- Model prices: dated snapshot; verify the live Nous Portal catalogue before spending money

## Editorial and pricing rule

The official documentation and live model catalogue win. Changes should be reviewed against the generated machine-readable index before publication. Examples must not contain credentials, tokens or connection strings. Price points are illustrative combinations, not guarantees or financial advice.

## Local verification

```bash
docker build -t hermes-field-guide:local .
docker run --rm -d --name hermes-field-guide-test -p 8080:80 hermes-field-guide:local
curl -fsS http://127.0.0.1:8080/healthz
curl -fsS http://127.0.0.1:8080/ | grep -q 'Hermes Field Guide'
docker rm -f hermes-field-guide-test
```
