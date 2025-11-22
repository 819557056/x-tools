<script setup lang="ts">
import type { lib } from 'crypto-js';
import { MD5, RIPEMD160, SHA1, SHA224, SHA256, SHA3, SHA384, SHA512, enc } from 'crypto-js';
import { sm3 } from 'sm-crypto';

import InputCopyable from '../../components/InputCopyable.vue';
import { convertHexToBin } from './hash-text.service';
import { useQueryParam } from '@/composable/queryParams';

const algos = {
  MD5,
  SHA1,
  SHA256,
  SHA224,
  SHA512,
  SHA384,
  SHA3,
  RIPEMD160,
  SM3: (text: string) => sm3(text),
} as const;

type AlgoNames = keyof typeof algos;
type Encoding = keyof typeof enc | 'Bin';
const algoNames = Object.keys(algos) as AlgoNames[];
const encoding = useQueryParam<Encoding>({ defaultValue: 'Hex', name: 'encoding' });
const clearText = ref('');

function formatWithEncoding(words: lib.WordArray | string, encoding: Encoding) {
  // SM3 returns a hex string directly
  if (typeof words === 'string') {
    if (encoding === 'Bin') {
      return convertHexToBin(words);
    }
    if (encoding === 'Hex') {
      return words;
    }
    // Convert hex string to Base64 or Base64url
    const hexStr = words;
    const bytes = hexStr.match(/.{2}/g)?.map(byte => Number.parseInt(byte, 16)) || [];
    const binaryStr = String.fromCharCode(...bytes);
    const base64 = btoa(binaryStr);
    if (encoding === 'Base64url') {
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    return base64;
  }

  if (encoding === 'Bin') {
    return convertHexToBin(words.toString(enc.Hex));
  }

  return words.toString(enc[encoding]);
}

const hashText = (algo: AlgoNames, value: string) => {
  const result = algos[algo](value);
  return formatWithEncoding(result, encoding.value);
};
</script>

<template>
  <div>
    <c-card>
      <c-input-text v-model:value="clearText" multiline raw-text placeholder="Your string to hash..." rows="3" autosize autofocus label="Your text to hash:" />

      <n-divider />

      <c-select
        v-model:value="encoding"
        mb-4
        label="Digest encoding"
        :options="[
          {
            label: 'Binary (base 2)',
            value: 'Bin',
          },
          {
            label: 'Hexadecimal (base 16)',
            value: 'Hex',
          },
          {
            label: 'Base64 (base 64)',
            value: 'Base64',
          },
          {
            label: 'Base64url (base 64 with url safe chars)',
            value: 'Base64url',
          },
        ]"
      />

      <div v-for="algo in algoNames" :key="algo" style="margin: 5px 0">
        <n-input-group>
          <n-input-group-label style="flex: 0 0 120px">
            {{ algo }}
          </n-input-group-label>
          <InputCopyable :value="hashText(algo, clearText)" readonly />
        </n-input-group>
      </div>
    </c-card>
  </div>
</template>
