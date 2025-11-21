<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'

const { t } = useI18n()
const message = useMessage()

const input = ref('')
const output = ref('')
const isDragging = ref(false)
const conversionType = ref<'pem-to-base64' | 'base64-to-pem' | 'base64-to-der' | 'der-to-base64' | 'der-to-pem' | 'pem-to-der' | 
  'pem-to-hex' | 'hex-to-pem' | 'base64-to-hex' | 'hex-to-base64' | 'der-to-hex' | 'hex-to-der'>('pem-to-base64')
const errorMessage = ref('')
const inputFileName = ref('')
const fileExtension = ref<'cer' | 'crt' | 'der'>('crt')
const isFromBinaryFile = ref(false) // 标记输入内容是否来自二进制 DER 文件

const conversionTypes = [
  { value: 'pem-to-base64', label: 'PEM → Base64' },
  { value: 'base64-to-pem', label: 'Base64 → PEM' },
  { value: 'base64-to-der', label: 'Base64 → DER' },
  { value: 'der-to-base64', label: 'DER → Base64' },
  { value: 'der-to-pem', label: 'DER → PEM' },
  { value: 'pem-to-der', label: 'PEM → DER' },
  { value: 'pem-to-hex', label: 'PEM → HEX' },
  { value: 'hex-to-pem', label: 'HEX → PEM' },
  { value: 'base64-to-hex', label: 'Base64 → HEX' },
  { value: 'hex-to-base64', label: 'HEX → Base64' },
  { value: 'der-to-hex', label: 'DER → HEX' },
  { value: 'hex-to-der', label: 'HEX → DER' },
]

// 检测输入内容的编码格式
const inputFormat = computed(() => {
  if (isFromBinaryFile.value) {
    return 'DER (Base64)'
  }
  return detectFormat(input.value)
})

// 检测输出内容的编码格式
const outputFormat = computed(() => {
  return detectFormat(output.value)
})

// 监听输入框，当清空时也清空输出框
watch(input, (newValue, oldValue) => {
  if (!newValue.trim()) {
    output.value = ''
    errorMessage.value = ''
    isFromBinaryFile.value = false
  } else if (oldValue !== undefined) {
    // 如果是用户手动编辑（不是首次设置），清除二进制文件标记
    isFromBinaryFile.value = false
  }
})

// 检测编码格式
function detectFormat(content: string): string {
  if (!content.trim()) {
    return ''
  }
  
  // 检测 PEM 格式
  if (content.includes('-----BEGIN') && content.includes('-----END')) {
    return 'PEM'
  }
  
  const trimmed = content.trim()
  
  // 检测 HEX 格式（纯16进制字符串）
  const hexRegex = /^[0-9A-Fa-f\s]+$/
  if (hexRegex.test(trimmed)) {
    const cleaned = trimmed.replace(/\s/g, '')
    // 确保是偶数长度且足够长
    if (cleaned.length >= 20 && cleaned.length % 2 === 0) {
      return 'HEX'
    }
  }
  
  // 检测纯 Base64 格式（无 PEM 头尾）
  const base64Regex = /^[A-Za-z0-9+/=\s]+$/
  
  if (base64Regex.test(trimmed)) {
    // 尝试解码以确认是有效的 Base64
    try {
      const cleaned = trimmed.replace(/\s/g, '')
      if (cleaned.length % 4 === 0) {
        atob(cleaned.substring(0, Math.min(100, cleaned.length)))
        return 'Base64'
      }
    } catch (e) {
      // 解码失败
    }
  }
  
  return t('tools.certificate-encoding-converter.unknownFormat')
}

// 文件拖拽处理
function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

// 检查是否为有效的 Base64 文本
function isValidBase64Text(text: string): boolean {
  const trimmed = text.trim()
  
  // 检查是否只包含 Base64 字符
  if (!/^[A-Za-z0-9+/\s]+={0,2}$/.test(trimmed)) {
    return false
  }
  
  // 移除空白字符
  const cleaned = trimmed.replace(/\s/g, '')
  
  // 长度必须合理（至少 20 个字符，避免误判）
  if (cleaned.length < 20) {
    return false
  }
  
  // 长度应该是 4 的倍数（或者有 1-2 个等号填充）
  if (cleaned.length % 4 !== 0) {
    return false
  }
  
  // 尝试解码前 100 个字符验证是否为有效 Base64
  try {
    atob(cleaned.substring(0, Math.min(100, cleaned.length)))
    return true
  } catch (e) {
    return false
  }
}

// 检查是否为二进制文件内容
function isBinaryContent(text: string): boolean {
  // 如果包含大量不可打印字符，可能是二进制
  const nonPrintableCount = Array.from(text).filter(char => {
    const code = char.charCodeAt(0)
    return code < 32 && code !== 9 && code !== 10 && code !== 13
  }).length
  
  // 如果超过 10% 是不可打印字符，认为是二进制
  return nonPrintableCount > text.length * 0.1
}

async function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) {
    return
  }
  
  const file = files[0]
  inputFileName.value = file.name
  
  try {
    // 先尝试作为文本读取
    const text = await file.text()
    
    // 检查是否包含二进制内容
    if (isBinaryContent(text)) {
      // 是二进制文件，重新读取为 ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      const base64 = arrayBufferToBase64(arrayBuffer)
      input.value = base64
      isFromBinaryFile.value = true
      message.success(t('tools.certificate-encoding-converter.fileLoadedAsBinary', { name: file.name }))
      return
    }
    
    // 检测是否为 PEM 格式（包含 BEGIN/END 标记）
    if (text.includes('-----BEGIN') && text.includes('-----END')) {
      // PEM 格式，直接使用文本，不做任何编码
      input.value = text
      isFromBinaryFile.value = false
      message.success(t('tools.certificate-encoding-converter.fileLoaded', { name: file.name }))
      return
    }
    
    // 检测是否为纯 Base64 格式
    if (isValidBase64Text(text)) {
      // 纯 Base64 格式，直接使用文本，不做任何编码
      input.value = text
      isFromBinaryFile.value = false
      message.success(t('tools.certificate-encoding-converter.fileLoaded', { name: file.name }))
      return
    }
    
    // 无法识别为文本格式，可能是不带 PEM 头的文本或其他格式
    // 作为普通文本处理
    if (text.trim().length > 0) {
      input.value = text
      isFromBinaryFile.value = false
      message.warning(t('tools.certificate-encoding-converter.fileLoadedAsText', { name: file.name }))
      return
    }
    
    // 空文件
    message.error(t('tools.certificate-encoding-converter.errors.emptyFile'))
  } catch (error: any) {
    // 如果文本读取失败，尝试作为二进制读取
    try {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = arrayBufferToBase64(arrayBuffer)
      input.value = base64
      isFromBinaryFile.value = true
      message.success(t('tools.certificate-encoding-converter.fileLoadedAsBinary', { name: file.name }))
    } catch (binaryError: any) {
      message.error(t('tools.certificate-encoding-converter.errors.fileReadError'))
    }
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

function detectCertificateType(base64: string): string {
  try {
    const decoded = atob(base64.substring(0, 100))
    if (decoded.includes('RSA')) {
      return 'RSA PRIVATE KEY'
    } else if (decoded.includes('EC')) {
      return 'EC PRIVATE KEY'
    } else if (decoded.includes('PRIVATE')) {
      return 'PRIVATE KEY'
    } else if (decoded.includes('PUBLIC')) {
      return 'PUBLIC KEY'
    }
  } catch (e) {
    // 如果解码失败，保持默认类型
  }
  return 'CERTIFICATE'
}

function convert() {
  errorMessage.value = ''
  output.value = ''
  
  try {
    const inputValue = input.value.trim()
    if (!inputValue) {
      errorMessage.value = t('tools.certificate-encoding-converter.errors.emptyInput')
      return
    }

    // 如果输出是 DER，则下载文件
    if (conversionType.value.endsWith('-to-der')) {
      downloadDerFile(inputValue)
      return
    }

    switch (conversionType.value) {
      case 'pem-to-base64':
        output.value = pemToBase64(inputValue)
        break
      case 'base64-to-pem':
        output.value = base64ToPem(inputValue)
        break
      case 'der-to-base64':
        output.value = derToBase64(inputValue)
        break
      case 'der-to-pem':
        output.value = derToPem(inputValue)
        break
      case 'pem-to-hex':
        output.value = pemToHex(inputValue)
        break
      case 'hex-to-pem':
        output.value = hexToPem(inputValue)
        break
      case 'base64-to-hex':
        output.value = base64ToHex(inputValue)
        break
      case 'hex-to-base64':
        output.value = hexToBase64(inputValue)
        break
      case 'der-to-hex':
        output.value = derToHex(inputValue)
        break
    }
  } catch (error: any) {
    errorMessage.value = error.message || t('tools.certificate-encoding-converter.errors.conversionFailed')
  }
}

// 清空所有内容
function clearAll() {
  input.value = ''
  output.value = ''
  errorMessage.value = ''
  inputFileName.value = ''
  isFromBinaryFile.value = false
  message.success(t('tools.certificate-encoding-converter.cleared'))
}

function pemToBase64(pemText: string): string {
  const base64 = pemText
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s/g, '')
  
  if (!base64) {
    throw new Error(t('tools.certificate-encoding-converter.errors.invalidPem'))
  }
  
  return base64
}

function base64ToPem(base64Text: string): string {
  const base64 = base64Text.replace(/\s/g, '')
  
  if (!base64) {
    throw new Error(t('tools.certificate-encoding-converter.errors.invalidBase64'))
  }
  
  const type = detectCertificateType(base64)
  const formattedBase64 = base64.match(/.{1,64}/g)?.join('\n') || base64
  
  return `-----BEGIN ${type}-----\n${formattedBase64}\n-----END ${type}-----`
}

function derToBase64(derBase64: string): string {
  // 如果输入来自二进制 DER 文件，它已经被转换为 Base64 了
  // 这里只需要移除空白字符并返回
  const base64 = derBase64.replace(/\s/g, '')
  
  if (!base64) {
    throw new Error(t('tools.certificate-encoding-converter.errors.invalidDer'))
  }
  
  return base64
}

function derToPem(derBase64: string): string {
  // DER 转 PEM 就是添加 PEM 头尾
  const base64 = derBase64.replace(/\s/g, '')
  
  if (!base64) {
    throw new Error(t('tools.certificate-encoding-converter.errors.invalidDer'))
  }
  
  const type = detectCertificateType(base64)
  const formattedBase64 = base64.match(/.{1,64}/g)?.join('\n') || base64
  
  return `-----BEGIN ${type}-----\n${formattedBase64}\n-----END ${type}-----`
}

// HEX 相关转换函数
function base64ToHex(base64Text: string): string {
  const base64 = base64Text.replace(/\s/g, '')
  
  if (!base64) {
    throw new Error(t('tools.certificate-encoding-converter.errors.invalidBase64'))
  }
  
  try {
    // Base64 → 二进制字符串
    const binaryString = atob(base64)
    // 二进制字符串 → HEX
    let hex = ''
    for (let i = 0; i < binaryString.length; i++) {
      const byte = binaryString.charCodeAt(i)
      hex += byte.toString(16).padStart(2, '0').toUpperCase()
    }
    
    // 格式化：每行 32 字节（64 个字符）
    return formatHex(hex)
  } catch (e) {
    throw new Error(t('tools.certificate-encoding-converter.errors.invalidBase64'))
  }
}

function hexToBase64(hexText: string): string {
  // 移除所有空白字符
  const hex = hexText.replace(/\s/g, '')
  
  if (!hex || hex.length % 2 !== 0) {
    throw new Error(t('tools.certificate-encoding-converter.errors.invalidHex'))
  }
  
  // 验证是否只包含 HEX 字符
  if (!/^[0-9A-Fa-f]+$/.test(hex)) {
    throw new Error(t('tools.certificate-encoding-converter.errors.invalidHex'))
  }
  
  try {
    // HEX → 二进制字符串
    let binaryString = ''
    for (let i = 0; i < hex.length; i += 2) {
      const byte = parseInt(hex.substr(i, 2), 16)
      binaryString += String.fromCharCode(byte)
    }
    
    // 二进制字符串 → Base64
    return btoa(binaryString)
  } catch (e) {
    throw new Error(t('tools.certificate-encoding-converter.errors.invalidHex'))
  }
}

function pemToHex(pemText: string): string {
  // PEM → Base64 → HEX
  const base64 = pemToBase64(pemText)
  return base64ToHex(base64)
}

function hexToPem(hexText: string): string {
  // HEX → Base64 → PEM
  const base64 = hexToBase64(hexText)
  return base64ToPem(base64)
}

function derToHex(derBase64: string): string {
  // DER (Base64) → HEX
  return base64ToHex(derBase64)
}

// 格式化 HEX 字符串：每 32 字节（64 个字符）换行
function formatHex(hex: string): string {
  // 每 64 个字符（32 字节）换行
  const lines = []
  for (let i = 0; i < hex.length; i += 64) {
    lines.push(hex.substr(i, 64))
  }
  return lines.join('\n')
}

function downloadDerFile(inputValue: string) {
  try {
    let base64: string
    
    // 根据输入类型提取 Base64
    if (conversionType.value === 'pem-to-der') {
      base64 = pemToBase64(inputValue)
    } else if (conversionType.value === 'base64-to-der') {
      base64 = inputValue.replace(/\s/g, '')
    } else if (conversionType.value === 'hex-to-der') {
      base64 = hexToBase64(inputValue)
    } else {
      throw new Error(t('tools.certificate-encoding-converter.errors.invalidConversion'))
    }
    
    // 将 Base64 转换为二进制
    const arrayBuffer = base64ToArrayBuffer(base64)
    const blob = new Blob([arrayBuffer], { type: 'application/x-x509-ca-cert' })
    
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = inputFileName.value ? 
      inputFileName.value.replace(/\.(pem|crt|cer|txt)$/i, '.der') : 
      'certificate.der'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    message.success(t('tools.certificate-encoding-converter.downloadSuccess'))
  } catch (error: any) {
    errorMessage.value = error.message || t('tools.certificate-encoding-converter.errors.conversionFailed')
  }
}

// 下载输出内容
function downloadOutput() {
  if (!output.value.trim()) {
    message.error(t('tools.certificate-encoding-converter.errors.emptyOutput'))
    return
  }
  
  try {
    const format = outputFormat.value
    let blob: Blob
    let fileName: string
    let extension: string
    
    // 根据输出格式决定文件扩展名
    if (format === 'HEX') {
      // HEX 格式固定使用 .txt 扩展名
      extension = 'txt'
      blob = new Blob([output.value], { type: 'text/plain' })
    } else if (format === 'PEM') {
      // PEM 格式使用用户选择的扩展名
      extension = fileExtension.value
      blob = new Blob([output.value], { type: 'application/x-pem-file' })
    } else if (format === 'Base64') {
      // Base64 格式使用用户选择的扩展名
      extension = fileExtension.value
      blob = new Blob([output.value], { type: 'text/plain' })
    } else {
      // 未知格式，使用用户选择的扩展名
      extension = fileExtension.value
      blob = new Blob([output.value], { type: 'text/plain' })
    }
    
    // 生成文件名
    if (inputFileName.value) {
      fileName = inputFileName.value.replace(/\.(pem|crt|cer|der|txt|hex)$/i, `.${extension}`)
    } else {
      fileName = format === 'HEX' ? `certificate.txt` : `certificate.${extension}`
    }
    
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    message.success(t('tools.certificate-encoding-converter.downloadSuccess'))
  } catch (error: any) {
    message.error(t('tools.certificate-encoding-converter.errors.downloadFailed'))
  }
}
</script>

<template>
  <div class="certificate-encoding-converter">
    <n-space vertical :size="16">
      <n-card :title="t('tools.certificate-encoding-converter.title')">
        {{ t('tools.certificate-encoding-converter.description') }}
      </n-card>

      <n-grid cols="1 m:3" responsive="screen" :x-gap="16">
        <!-- 左侧：输入框 -->
        <n-gi span="1">
          <n-card>
            <template #header>
              <div class="card-header-with-format">
                <span>{{ t('tools.certificate-encoding-converter.input') }}</span>
                <n-tag v-if="inputFormat" type="info" size="small">
                  {{ inputFormat }}
                </n-tag>
              </div>
            </template>
            <div 
              class="drop-zone"
              :class="{ 'is-dragging': isDragging }"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              @drop="handleDrop"
            >
              <div v-if="!input" class="drop-zone-placeholder">
                <n-icon size="48" :component="() => '📄'" />
                <p>{{ t('tools.certificate-encoding-converter.dropHint') }}</p>
                <p class="hint-text">{{ t('tools.certificate-encoding-converter.dropHintSub') }}</p>
              </div>
              <n-input
                v-model:value="input"
                type="textarea"
                :placeholder="t('tools.certificate-encoding-converter.inputPlaceholder')"
                :rows="20"
                :autosize="{ minRows: 20, maxRows: 30 }"
              />
              <div v-if="inputFileName" class="file-name">
                📎 {{ inputFileName }}
              </div>
            </div>
          </n-card>
        </n-gi>

        <!-- 中间：转换选项 -->
        <n-gi span="1">
          <n-card :title="t('tools.certificate-encoding-converter.conversionType')">
            <n-space vertical :size="16">
              <n-radio-group v-model:value="conversionType">
                <n-space vertical>
                  <n-radio
                    v-for="type in conversionTypes"
                    :key="type.value"
                    :value="type.value"
                    :label="type.label"
                  />
                </n-space>
              </n-radio-group>

              <n-button
                type="primary"
                block
                @click="convert"
                :disabled="!input"
              >
                {{ conversionType.endsWith('-to-der') ? 
                   t('tools.certificate-encoding-converter.download') : 
                   t('tools.certificate-encoding-converter.convert') }}
              </n-button>

              <n-divider style="margin: 8px 0">{{ t('tools.certificate-encoding-converter.downloadSection') }}</n-divider>

              <div>
                <label style="font-size: 14px; color: #666; margin-bottom: 8px; display: block;">
                  {{ t('tools.certificate-encoding-converter.fileExtension') }}
                </label>
                <n-radio-group v-model:value="fileExtension" size="small">
                  <n-space>
                    <n-radio value="crt" label=".crt" />
                    <n-radio value="cer" label=".cer" />
                    <n-radio value="der" label=".der" />
                  </n-space>
                </n-radio-group>
              </div>

              <n-button
                block
                @click="downloadOutput"
                :disabled="!output"
                secondary
              >
                {{ t('tools.certificate-encoding-converter.downloadOutput') }}
              </n-button>

              <n-button
                block
                @click="clearAll"
                :disabled="!input && !output"
                tertiary
                type="warning"
              >
                {{ t('tools.certificate-encoding-converter.clearAll') }}
              </n-button>

              <n-alert v-if="errorMessage" type="error" :title="t('tools.certificate-encoding-converter.error')">
                {{ errorMessage }}
              </n-alert>
            </n-space>
          </n-card>
        </n-gi>

        <!-- 右侧：输出框 -->
        <n-gi span="1">
          <n-card>
            <template #header>
              <div class="card-header-with-format">
                <span>{{ t('tools.certificate-encoding-converter.output') }}</span>
                <n-tag v-if="outputFormat" type="success" size="small">
                  {{ outputFormat }}
                </n-tag>
              </div>
            </template>
            <n-input
              v-model:value="output"
              type="textarea"
              :placeholder="t('tools.certificate-encoding-converter.outputPlaceholder')"
              :rows="20"
              :autosize="{ minRows: 20, maxRows: 30 }"
              readonly
            />
          </n-card>
        </n-gi>
      </n-grid>

      <n-card :title="t('tools.certificate-encoding-converter.about.title')">
        <n-space vertical :size="12">
          <div>
            <strong>{{ t('tools.certificate-encoding-converter.about.pemTitle') }}</strong>
            <p>{{ t('tools.certificate-encoding-converter.about.pemDescription') }}</p>
          </div>
          <div>
            <strong>{{ t('tools.certificate-encoding-converter.about.base64Title') }}</strong>
            <p>{{ t('tools.certificate-encoding-converter.about.base64Description') }}</p>
          </div>
          <div>
            <strong>{{ t('tools.certificate-encoding-converter.about.derTitle') }}</strong>
            <p>{{ t('tools.certificate-encoding-converter.about.derDescription') }}</p>
          </div>
          <div>
            <strong>{{ t('tools.certificate-encoding-converter.about.hexTitle') }}</strong>
            <p>{{ t('tools.certificate-encoding-converter.about.hexDescription') }}</p>
          </div>
          <div>
            <strong>{{ t('tools.certificate-encoding-converter.about.usage') }}</strong>
            <ul>
              <li>{{ t('tools.certificate-encoding-converter.about.usageItem1') }}</li>
              <li>{{ t('tools.certificate-encoding-converter.about.usageItem2') }}</li>
              <li>{{ t('tools.certificate-encoding-converter.about.usageItem3') }}</li>
              <li>{{ t('tools.certificate-encoding-converter.about.usageItem4') }}</li>
            </ul>
          </div>
        </n-space>
      </n-card>
    </n-space>
  </div>
</template>

<style scoped>
.certificate-encoding-converter {
  width: 100%;
}

.card-header-with-format {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.drop-zone {
  position: relative;
  min-height: 200px;
  border: 2px dashed transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.drop-zone.is-dragging {
  border-color: #18a058;
  background-color: rgba(24, 160, 88, 0.05);
}

.drop-zone-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  color: #999;
  z-index: 1;
}

.drop-zone-placeholder p {
  margin: 8px 0;
  font-size: 16px;
}

.drop-zone-placeholder .hint-text {
  font-size: 14px;
  color: #666;
}

.file-name {
  margin-top: 8px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}
</style>

<!-- 全局样式：让父容器也能充满宽度 -->
<style>
/* 让 certificate-encoding-converter 工具的父容器充满整个宽度 */
.tool-content:has(.certificate-encoding-converter) {
  max-width: 100% !important;
  width: 100% !important;
}

.tool-content:has(.certificate-encoding-converter) > * {
  flex: 1 1 100% !important;
  max-width: none !important;
}
</style>