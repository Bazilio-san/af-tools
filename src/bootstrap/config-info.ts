/*
Вывод стартовой диагностики в консоль
*/
import * as config from 'config';
import { echo } from 'af-echo-ts';
import { lBlue, cyan, yellow } from 'af-color';
import { Debug } from '../debug';
import { infoBlock } from './info-block';

const YAML = require('json-to-pretty-yaml');

export const configInfo = (arg: { cfg: any, debugId?: string, dotEnvResult?: any }) => {
  const { cfg, debugId, dotEnvResult } = arg;
  if (!Debug(debugId || 'config-info').enabled) {
    return;
  }
  const configSrc = config.util.getConfigSources();
  const customEnvSrc = configSrc.find((o) => o.name.includes('custom-environment-variables'))?.original || '';
  const envsUsed: any = {};
  [...customEnvSrc.matchAll(/^ *[^\s:]+: ([A-Z_\d]+)/img)].map((arr) => arr[1]).forEach((name) => {
    if (process.env[name] !== undefined) {
      envsUsed[name] = process.env[name];
    }
  });
  if (dotEnvResult) {
    if (!dotEnvResult.error && dotEnvResult.parsed) {
      Object.entries(dotEnvResult.parsed).forEach(([k, v]) => {
        envsUsed[k] = v;
      });
    }
  }
  const [, configDir = ''] = /^(.+?)([^\\/]+)$/.exec(configSrc[0].name) || [];

  infoBlock({
    echo,
    title: 'СONFIG SOURCES',
    padding: 0,
    valueColor: lBlue,
    info: [
      ['CONFIG DIR', configDir],
      ...configSrc.map((v) => v.name.replace(configDir, '')),
    ],
  });
  infoBlock({ echo, title: 'ACTUAL SOURCES', info: YAML.stringify(cfg), valueColor: cyan });
  infoBlock({ echo, title: 'Using .env', info: YAML.stringify(envsUsed), titleColor: yellow, valueColor: yellow });
};
