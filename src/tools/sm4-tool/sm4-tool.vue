<script setup lang="ts">
import { sm4 } from 'sm-crypto';

// 加密部分
const encryptInput = ref('Hello, SM4!');
const encryptKey = ref('0123456789abcdeffedcba9876543210'); // 128位密钥 (32个hex字符)
const encryptMode = ref<'ecb' | 'cbc'>('ecb');
const encryptIv = ref('0123456789abcdeffedcba9876543210'); // CBC模式需要IV
const encryptResult = computed(() => {
  try {
    const options: any = {
      mode: encryptMode.value,
      padding: 'pkcs#7',
    };
    
    if (encryptMode.value === 'cbc')
      options.iv = encryptIv.value;

    return sm4.encrypt(encryptInput.value, encryptKey.value, options) as string;
  }
  catch (error: unknown) {
    return `错误: ${(error as Error).message}`;
  }
});

// 解密部分
const decryptInput = ref('');
const decryptKey = ref('0123456789abcdeffedcba9876543210');
const decryptMode = ref<'ecb' | 'cbc'>('ecb');
const decryptIv = ref('0123456789abcdeffedcba9876543210');
const decryptResult = computed(() => {
  try {
    if (!decryptInput.value)
      return '';

    const options: any = {
      mode: decryptMode.value,
      padding: 'pkcs#7',
    };
    
    if (decryptMode.value === 'cbc')
      options.iv = decryptIv.value;

    return sm4.decrypt(decryptInput.value, decryptKey.value, options) as string;
  }
  catch (error: unknown) {
    return `错误: ${(error as Error).message}`;
  }
});

// 生成随机密钥
function generateRandomKey() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  encryptKey.value = key;
  decryptKey.value = key;
}

// 生成随机IV
function generateRandomIv() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const iv = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  encryptIv.value = iv;
  decryptIv.value = iv;
}

// 复制加密结果到解密输入
function copyToDecrypt() {
  decryptInput.value = encryptResult.value;
  decryptKey.value = encryptKey.value;
  decryptMode.value = encryptMode.value;
  decryptIv.value = encryptIv.value;
}

const modeOptions = [
  { label: 'ECB (电子密码本模式)', value: 'ecb' },
  { label: 'CBC (密码分组链接模式)', value: 'cbc' },
];
</script>

<template>
  <c-card title="SM4 加密">
    <div flex gap-3 mb-4>
      <div flex-1>
        <c-input-text
          v-model:value="encryptKey"
          label="密钥 (32位十六进制字符):"
          placeholder="0123456789abcdeffedcba9876543210"
          clearable
          raw-text
          monospace
        />
      </div>
      <div flex items-end>
        <c-button @click="generateRandomKey">
          生成随机密钥
        </c-button>
      </div>
    </div>

    <div flex gap-3 mb-4>
      <div flex-1>
        <c-select
          v-model:value="encryptMode"
          label="加密模式:"
          :options="modeOptions"
        />
      </div>
      <div v-if="encryptMode === 'cbc'" flex-1>
        <c-input-text
          v-model:value="encryptIv"
          label="初始向量 IV (32位十六进制字符):"
          placeholder="0123456789abcdeffedcba9876543210"
          clearable
          raw-text
          monospace
        />
      </div>
      <div v-if="encryptMode === 'cbc'" flex items-end>
        <c-button @click="generateRandomIv">
          生成随机IV
        </c-button>
      </div>
    </div>

    <c-input-text
      v-model:value="encryptInput"
      label="明文:"
      placeholder="请输入要加密的文本"
      rows="4"
      multiline
      raw-text
      monospace
      autosize
      mb-4
    />

    <div flex gap-2 items-end>
      <div flex-1>
        <c-input-text
          label="密文 (Hex):"
          :value="encryptResult"
          placeholder="加密结果..."
          rows="3"
          multiline
          monospace
          readonly
          autosize
        />
      </div>
      <c-button @click="copyToDecrypt">
        复制到解密
      </c-button>
    </div>
  </c-card>

  <c-card title="SM4 解密">
    <div flex gap-3 mb-4>
      <div flex-1>
        <c-input-text
          v-model:value="decryptKey"
          label="密钥 (32位十六进制字符):"
          placeholder="0123456789abcdeffedcba9876543210"
          clearable
          raw-text
          monospace
        />
      </div>
    </div>

    <div flex gap-3 mb-4>
      <div flex-1>
        <c-select
          v-model:value="decryptMode"
          label="解密模式:"
          :options="modeOptions"
        />
      </div>
      <div v-if="decryptMode === 'cbc'" flex-1>
        <c-input-text
          v-model:value="decryptIv"
          label="初始向量 IV (32位十六进制字符):"
          placeholder="0123456789abcdeffedcba9876543210"
          clearable
          raw-text
          monospace
        />
      </div>
    </div>

    <c-input-text
      v-model:value="decryptInput"
      label="密文 (Hex):"
      placeholder="请输入要解密的密文"
      rows="4"
      multiline
      raw-text
      monospace
      autosize
      mb-4
    />

    <c-input-text
      label="明文:"
      :value="decryptResult"
      placeholder="解密结果..."
      rows="3"
      multiline
      monospace
      readonly
      autosize
    />
  </c-card>

  <c-card title="关于 SM4">
    <div text-sm text-gray-600>
      <p>
        <strong>SM4</strong> 是中国国家密码管理局发布的分组密码算法标准，也被称为 SMS4。
      </p>
      <ul mt-2 pl-4 space-y-1>
        <li>• 分组长度：128 位 (16 字节)</li>
        <li>• 密钥长度：128 位 (16 字节 = 32 个十六进制字符)</li>
        <li>• 支持模式：ECB、CBC 等</li>
        <li>• ECB 模式：简单但不够安全，相同明文块产生相同密文块</li>
        <li>• CBC 模式：更安全，需要初始向量 (IV)，相同明文块产生不同密文块</li>
      </ul>
      <p mt-2>
        适用于无线局域网产品、商用密码应用等场景。
      </p>
    </div>
  </c-card>
</template>

