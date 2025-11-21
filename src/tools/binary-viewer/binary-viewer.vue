<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';

const fileInput = ref() as Ref<File>;
const hexOutput = ref('');
const bytesPerLine = ref(16);
const startOffset = ref(0);

function toHex(num: number, padding: number = 2): string {
  return num.toString(16).toUpperCase().padStart(padding, '0');
}

function isPrintableAscii(byte: number): boolean {
  return byte >= 0x20 && byte <= 0x7E;
}

async function processFile(file: File) {
  if (!file) {
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    let output = '';
    // 确保数值有效
    const perLine = Number(bytesPerLine.value) || 16;
    const offset = Number(startOffset.value) || 0;
    
    // 验证边界
    const validPerLine = Math.max(8, Math.min(32, perLine));
    
    for (let i = 0; i < bytes.length; i += validPerLine) {
      // 地址部分 (8位十六进制)
      const address = offset + i;
      output += toHex(address, 8) + '  ';
      
      // 十六进制字节部分
      const lineBytes = bytes.slice(i, i + validPerLine);
      for (let j = 0; j < validPerLine; j++) {
        if (j < lineBytes.length) {
          output += toHex(lineBytes[j]) + ' ';
        } else {
          output += '   '; // 空位填充
        }
      }
      
      output += ' ';
      
      // ASCII 字符部分
      for (let j = 0; j < lineBytes.length; j++) {
        const byte = lineBytes[j];
        if (isPrintableAscii(byte)) {
          output += String.fromCharCode(byte);
        } else {
          output += '.';
        }
      }
      
      output += '\n';
    }
    
    hexOutput.value = output;
  } catch (error) {
    console.error('Error processing file:', error);
    hexOutput.value = 'Error processing file';
  }
}

async function onUpload(file: File) {
  if (file) {
    fileInput.value = file;
    await processFile(file);
  }
}

// 当参数变化时重新处理文件
watch([bytesPerLine, startOffset], async () => {
  if (fileInput.value) {
    await processFile(fileInput.value);
  }
});

function clearAll() {
  hexOutput.value = '';
  fileInput.value = undefined as any;
  startOffset.value = 0;
}

function copyToClipboard() {
  if (hexOutput.value) {
    navigator.clipboard.writeText(hexOutput.value);
  }
}
</script>

<template>
  <div>
    <c-card :title="$t('tools.binary-viewer.upload')">
      <c-file-upload 
        :title="$t('tools.binary-viewer.uploadHint')" 
        @file-upload="onUpload" 
      />
      
      <div mt-4>
        <n-grid cols="2" x-gap="12">
          <n-gi>
            <div mb-2>
              <label class="input-label">{{ $t('tools.binary-viewer.bytesPerLine') }}</label>
              <n-input-number
                v-model:value="bytesPerLine"
                :placeholder="$t('tools.binary-viewer.bytesPerLinePlaceholder')"
                :min="8"
                :max="32"
                :step="8"
                style="width: 100%"
              />
            </div>
          </n-gi>
          <n-gi>
            <div mb-2>
              <label class="input-label">{{ $t('tools.binary-viewer.startOffset') }}</label>
              <n-input-number
                v-model:value="startOffset"
                :placeholder="$t('tools.binary-viewer.startOffsetPlaceholder')"
                :min="0"
                style="width: 100%"
              />
            </div>
          </n-gi>
        </n-grid>
      </div>
    </c-card>

    <c-card :title="$t('tools.binary-viewer.output')" v-if="hexOutput">
      <div class="hex-viewer">
        <pre>{{ hexOutput }}</pre>
      </div>
      
      <div flex justify-center gap-3 mt-4>
        <c-button @click="copyToClipboard">
          {{ $t('tools.binary-viewer.copy') }}
        </c-button>
        <c-button @click="clearAll">
          {{ $t('tools.binary-viewer.clear') }}
        </c-button>
      </div>
    </c-card>

    <c-card :title="$t('tools.binary-viewer.about.title')">
      <n-alert type="info" :bordered="false">
        <div>
          <p><strong>{{ $t('tools.binary-viewer.about.format') }}</strong></p>
          <ul>
            <li>{{ $t('tools.binary-viewer.about.formatItem1') }}</li>
            <li>{{ $t('tools.binary-viewer.about.formatItem2') }}</li>
            <li>{{ $t('tools.binary-viewer.about.formatItem3') }}</li>
          </ul>
          <p mt-2><strong>{{ $t('tools.binary-viewer.about.usage') }}</strong></p>
          <ul>
            <li>{{ $t('tools.binary-viewer.about.usageItem1') }}</li>
            <li>{{ $t('tools.binary-viewer.about.usageItem2') }}</li>
            <li>{{ $t('tools.binary-viewer.about.usageItem3') }}</li>
          </ul>
        </div>
      </n-alert>
    </c-card>
  </div>
</template>

<style lang="less" scoped>
.hex-viewer {
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  
  pre {
    margin: 0;
    font-family: 'Courier New', Consolas, Monaco, monospace;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre;
  }
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

::v-deep(.n-upload-trigger) {
  width: 100%;
}
</style>

