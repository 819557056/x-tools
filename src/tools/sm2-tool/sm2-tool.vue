<script setup lang="ts">
import { sm2 } from 'sm-crypto';

// 密钥管理
const publicKey = ref('');
const privateKey = ref('');

// 生成密钥对
function generateKeyPair() {
  const keypair = sm2.generateKeyPairHex();
  publicKey.value = keypair.publicKey;
  privateKey.value = keypair.privateKey;
}

// 加密/解密
const operationMode = ref<'encrypt' | 'decrypt' | 'sign' | 'verify'>('encrypt');
const cipherMode = ref(1); // 1: C1C3C2 (新标准), 0: C1C2C3 (旧标准)

const encryptInput = ref('Hello, SM2!');
const encryptOutput = ref('');

const decryptInput = ref('');
const decryptOutput = ref('');

const signInput = ref('Message to sign');
const signOutput = ref('');

const verifyMessage = ref('');
const verifySignature = ref('');
const verifyResult = ref<boolean | null>(null);

// 执行加密
function doEncrypt() {
  try {
    if (!publicKey.value.trim()) {
      encryptOutput.value = '错误: 请先生成或输入公钥';
      return;
    }
    if (!encryptInput.value.trim()) {
      encryptOutput.value = '错误: 请输入要加密的内容';
      return;
    }
    encryptOutput.value = sm2.doEncrypt(encryptInput.value.trim(), publicKey.value.trim(), cipherMode.value);
  }
  catch (error: unknown) {
    encryptOutput.value = `错误: ${(error as Error).message}`;
  }
}

// 执行解密
function doDecrypt() {
  try {
    if (!privateKey.value.trim()) {
      decryptOutput.value = '错误: 请先生成或输入私钥';
      return;
    }
    if (!decryptInput.value.trim()) {
      decryptOutput.value = '错误: 请输入要解密的密文';
      return;
    }
    decryptOutput.value = sm2.doDecrypt(decryptInput.value.trim(), privateKey.value.trim(), cipherMode.value);
  }
  catch (error: unknown) {
    decryptOutput.value = `错误: ${(error as Error).message}`;
  }
}

// 执行签名
function doSign() {
  try {
    if (!privateKey.value.trim()) {
      signOutput.value = '错误: 请先生成或输入私钥';
      return;
    }
    if (!signInput.value.trim()) {
      signOutput.value = '错误: 请输入待签名的消息';
      return;
    }
    // 对输入进行 trim 处理，去除多余空格和换行
    signOutput.value = sm2.doSignature(signInput.value.trim(), privateKey.value.trim());
  }
  catch (error: unknown) {
    signOutput.value = `错误: ${(error as Error).message}`;
  }
}

// 执行验签
function doVerify() {
  try {
    if (!publicKey.value.trim()) {
      verifyResult.value = null;
      return;
    }
    if (!verifyMessage.value.trim()) {
      verifyResult.value = null;
      return;
    }
    if (!verifySignature.value.trim()) {
      verifyResult.value = null;
      return;
    }
    // 对所有输入进行 trim 处理
    verifyResult.value = sm2.doVerifySignature(
      verifyMessage.value.trim(), 
      verifySignature.value.trim(), 
      publicKey.value.trim()
    );
  }
  catch (error: unknown) {
    console.error('验签错误:', error);
    verifyResult.value = false;
  }
}

// 复制加密结果到解密输入
function copyToDecrypt() {
  decryptInput.value = encryptOutput.value;
  operationMode.value = 'decrypt';
}

// 复制签名到验签
function copyToVerify() {
  verifyMessage.value = signInput.value;
  verifySignature.value = signOutput.value;
  operationMode.value = 'verify';
}

const modeOptions = [
  { label: '加密', value: 'encrypt' },
  { label: '解密', value: 'decrypt' },
  { label: '签名', value: 'sign' },
  { label: '验签', value: 'verify' },
];

const cipherModeOptions = [
  { label: 'C1C3C2 (新标准/常用)', value: 1 },
  { label: 'C1C2C3 (旧标准)', value: 0 },
];
</script>

<template>
  <c-card title="密钥管理">
    <div flex gap-2 mb-4>
      <c-button type="primary" @click="generateKeyPair">
        生成随机密钥对
      </c-button>
    </div>

    <c-input-text
      v-model:value="publicKey"
      label="公钥 (Hex，04开头的130字符):"
      placeholder="04..."
      rows="2"
      multiline
      raw-text
      monospace
      autosize
      mb-3
    />

    <c-input-text
      v-model:value="privateKey"
      label="私钥 (Hex，64字符):"
      placeholder="私钥 (请妥善保管)"
      rows="2"
      multiline
      raw-text
      monospace
      autosize
    />
  </c-card>

  <c-card title="操作配置">
    <div flex gap-3>
      <div flex-1>
        <c-select
          v-model:value="operationMode"
          label="操作模式:"
          :options="modeOptions"
        />
      </div>
      <div v-if="['encrypt', 'decrypt'].includes(operationMode)" flex-1>
        <c-select
          v-model:value="cipherMode"
          label="密文模式:"
          :options="cipherModeOptions"
        />
      </div>
    </div>
  </c-card>

  <!-- 加密 -->
  <c-card v-if="operationMode === 'encrypt'" title="SM2 加密">
    <c-input-text
      v-model:value="encryptInput"
      label="明文:"
      placeholder="请输入要加密的内容"
      rows="4"
      multiline
      raw-text
      monospace
      autosize
      mb-4
    />

    <c-button block type="primary" mb-4 @click="doEncrypt">
      执行加密
    </c-button>

    <div flex gap-2 items-end>
      <div flex-1>
        <c-input-text
          v-model:value="encryptOutput"
          label="密文 (Hex):"
          placeholder="加密结果..."
          rows="4"
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

  <!-- 解密 -->
  <c-card v-if="operationMode === 'decrypt'" title="SM2 解密">
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

    <c-button block type="primary" mb-4 @click="doDecrypt">
      执行解密
    </c-button>

    <c-input-text
      v-model:value="decryptOutput"
      label="明文:"
      placeholder="解密结果..."
      rows="4"
      multiline
      monospace
      readonly
      autosize
    />
  </c-card>

  <!-- 签名 -->
  <c-card v-if="operationMode === 'sign'" title="SM2 签名">
    <c-input-text
      v-model:value="signInput"
      label="待签名消息:"
      placeholder="请输入要签名的消息"
      rows="4"
      multiline
      raw-text
      monospace
      autosize
      mb-4
    />

    <c-button block type="primary" mb-4 @click="doSign">
      执行签名
    </c-button>

    <div flex gap-2 items-end>
      <div flex-1>
        <c-input-text
          v-model:value="signOutput"
          label="签名值 (Hex):"
          placeholder="签名结果..."
          rows="3"
          multiline
          monospace
          readonly
          autosize
        />
      </div>
      <c-button @click="copyToVerify">
        复制到验签
      </c-button>
    </div>
  </c-card>

  <!-- 验签 -->
  <c-card v-if="operationMode === 'verify'" title="SM2 验签">
    <c-input-text
      v-model:value="verifyMessage"
      label="原始消息:"
      placeholder="请输入原始消息"
      rows="4"
      multiline
      raw-text
      monospace
      autosize
      mb-4
    />

    <c-input-text
      v-model:value="verifySignature"
      label="签名值 (Hex):"
      placeholder="请输入签名值"
      rows="3"
      multiline
      raw-text
      monospace
      autosize
      mb-4
    />

    <c-button block type="primary" mb-4 @click="doVerify">
      验证签名
    </c-button>

    <n-alert v-if="verifyResult === true" type="success" title="验证成功 ✅">
      签名验证通过，消息未被篡改
    </n-alert>
    <n-alert v-else-if="verifyResult === false" type="error" title="验证失败 ❌">
      签名验证失败，消息可能已被篡改或签名不匹配
    </n-alert>
    <n-alert v-else type="info" title="待验证">
      请输入消息和签名后点击"验证签名"按钮
    </n-alert>
  </c-card>

  <c-card title="关于 SM2">
    <div text-sm text-gray-600>
      <p>
        <strong>SM2</strong> 是中国国家密码管理局发布的椭圆曲线公钥密码算法标准，包含数字签名、密钥交换和公钥加密。
      </p>
      <ul mt-2 pl-4 space-y-1>
        <li>• 基于椭圆曲线密码学 (ECC)，安全性高于 RSA 1024</li>
        <li>• 公钥长度：256 位 (未压缩格式为 04 开头 + 130 个十六进制字符)</li>
        <li>• 私钥长度：256 位 (64 个十六进制字符)</li>
        <li>• 支持加密/解密、数字签名/验签等操作</li>
        <li>• C1C3C2 是新标准格式 (推荐)，C1C2C3 是旧标准格式</li>
      </ul>
      <p mt-2>
        <strong>注意：</strong> 私钥请妥善保管，不要泄露给他人。公钥可以公开分享。
      </p>
    </div>
  </c-card>
</template>

