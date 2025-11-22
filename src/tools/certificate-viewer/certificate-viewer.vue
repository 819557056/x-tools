<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { parseCertificate, parseCertificateFromFile, formatDistinguishedName, type CertificateInfo } from './certificate-viewer.service';

const message = useMessage();

const input = ref('');
const inputMode = ref<'text' | 'file'>('text');
const inputFormat = ref<'auto' | 'pem' | 'base64' | 'hex'>('auto');
const certificateInfo = ref<CertificateInfo | null>(null);
const errorMessage = ref('');
const isDragging = ref(false);
const activeTab = ref('general');
const fileName = ref('');

// 解析证书
const parseCert = () => {
  errorMessage.value = '';
  certificateInfo.value = null;

  if (!input.value.trim()) {
    errorMessage.value = '请输入证书内容';
    return;
  }

  try {
    certificateInfo.value = parseCertificate(input.value.trim());
    message.success('证书解析成功');
  } catch (error: any) {
    errorMessage.value = error.message;
    message.error('证书解析失败');
  }
};

// 处理文件上传
const handleFileUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  await parseFile(file);
  target.value = ''; // 重置文件输入
};

// 解析文件
const parseFile = async (file: File) => {
  errorMessage.value = '';
  certificateInfo.value = null;
  fileName.value = file.name;

  try {
    certificateInfo.value = await parseCertificateFromFile(file);
    message.success(`证书文件 "${file.name}" 解析成功`);
  } catch (error: any) {
    errorMessage.value = error.message;
    message.error('证书文件解析失败');
  }
};

// 拖放处理
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;
};

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;

  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;

  await parseFile(files[0]);
};

// 清空
const clearAll = () => {
  input.value = '';
  certificateInfo.value = null;
  errorMessage.value = '';
  fileName.value = '';
  activeTab.value = 'general';
  message.success('已清空');
};

// 复制文本
const copyText = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  message.success(`${label} 已复制到剪贴板`);
};

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 证书是否有效
const isValidCert = computed(() => {
  if (!certificateInfo.value) return null;
  
  const now = new Date();
  const validFrom = new Date(certificateInfo.value.validFrom);
  const validTo = new Date(certificateInfo.value.validTo);
  
  return now >= validFrom && now <= validTo;
});

// 示例证书 (Let's Encrypt)
const loadExample = () => {
  input.value = `-----BEGIN CERTIFICATE-----
MIIFazCCBFOgAwIBAgISBKMZ3U9Qi9VPDKmFXN+zRvwRMA0GCSqGSIb3DQEBCwUA
MDIxCzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQswCQYDVQQD
EwJSMzAeFw0yMzA1MDEwMDAwMDBaFw0yMzA3MzAyMzU5NTlaMBcxFTATBgNVBAMT
DGV4YW1wbGUuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwHjL
+v4nzmk0L3qlOqOkZbIRAqLvTfbKzXmhBbq0qXGlmpfwYSUE7VKHZNcqHKvFcqDR
7rkQGKNQNYqEeIzHYEiSHXKBLhOvVmCQqzv9FqRKRCqpqPxHZaHNXqZSKBFvCaqK
W8T8PlKOPxnbO3pOvnxVJE7xLYxMoOjBHQZxhKQGVkXEMjEL3rSMhYE7Yt8I1O8x
gTH5PhMhxNwKV4FQhJvq4VYfGOi5VYBVPlY0vM7aRW0B7tBE5lVVCT4e7f3c6hLp
1GXOPVVQOQvGBVFePtKfQC2dHQxRGv7VCMjHZhEGQxH6hI8pMfHMBvKG8G+0k0kH
n6bU5xJL7Y+D2n3cDwIDAQABo4ICWTCCAlUwDgYDVR0PAQH/BAQDAgWgMB0GA1Ud
JQQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAjAMBgNVHRMBAf8EAjAAMB0GA1UdDgQW
BBQbfLBMbKKGJLVh7Z3qjLVh7Z3qjDAf BgNVHSMEGDAWgBQULrMXt1hWy65QCUDm
H6+dixTCxjBVBggrBgEFBQcBAQRJMEcwIQYIKwYBBQUHMAGGFWh0dHA6Ly9yMy5v
LmxlbmNyLm9yZzAiBggrBgEFBQcwAoYWaHR0cDovL3IzLmkubGVuY3Iub3JnLzAX
BgNVHREEEDAOggxleGFtcGxlLmNvbTBMBgNVHSAERTBDMAgGBmeBDAECATAOBgwr
BgEEAYLfEwEBAwEwJwYDVR0lBCAwHgYIKwYBBQUHAwEGCCsGAQUFBwMCBggrBgEF
BQcDAzCCAQUGCisGAQQB1nkCBAIEgfYEgfMA8QB2AG9Tdqwx8DEZ2JkApFEV/3cV
HBHZAsEAKQaNsgiaN9kTAAABiCCz3iEAAAQDAEcwRQIhAOdqPSjzLOZBvUhWkPyT
lJJPvFaNuP1qaMD9fJXPRH9yAiB3qH8c7Qo+WqJZLKQ3t4Z8xN7L3x0z2x0xY8zL
3x0zMA0GCSqGSIb3DQEBCwUAA4IBAQBvKQxMj9cLYBH8G7VwZqNKv1sJGH0pCPHG
RJZhYLK8hCPl8G5VQ3KO7RBvH2h7pK5xPxYJH0K8kT7JL2xE5bQG7H8G5VQ3KO7R
BvH2h7pK5xPxYJH0K8kT7JL2xE5bQG7H8G5VQ3KO7RBvH2h7pK5xPxYJH0K8kT7J
L2xE5bQG7H8G5VQ3KO7RBvH2h7pK5xPxYJH0K8kT7JL2xE5bQG7H8G5VQ3KO7RBv
H2h7pK5xPxYJH0K8kT7JL2xE5bQG7H8G5VQ3KO7RBvH2h7pK5xPxYJH0K8kT7JL2
xE5bQG7H8G5VQ3KO7RBvH2h7pK5xPxYJH0K8kT7JL2xE5bQG7H==
-----END CERTIFICATE-----`;
  message.info('已加载示例证书（Let\'s Encrypt）');
};
</script>

<template>
  <div class="certificate-viewer">
    <n-space vertical :size="16">
      <!-- 输入区域 -->
      <n-card title="证书输入">
        <n-space vertical :size="12">
          <!-- 输入模式选择 -->
          <n-radio-group v-model:value="inputMode">
            <n-space>
              <n-radio value="text">文本输入</n-radio>
              <n-radio value="file">文件上传</n-radio>
            </n-space>
          </n-radio-group>

          <!-- 文本输入 -->
          <div v-if="inputMode === 'text'">
            <n-space vertical :size="12">
              <div>
                <label style="font-size: 14px; color: #666; margin-bottom: 8px; display: block;">
                  输入格式
                </label>
                <n-radio-group v-model:value="inputFormat">
                  <n-space>
                    <n-radio value="auto">自动识别</n-radio>
                    <n-radio value="pem">PEM</n-radio>
                    <n-radio value="base64">Base64</n-radio>
                    <n-radio value="hex">HEX</n-radio>
                  </n-space>
                </n-radio-group>
              </div>

              <div
                class="drop-zone"
                :class="{ 'is-dragging': isDragging }"
                @dragover="handleDragOver"
                @dragleave="handleDragLeave"
                @drop="handleDrop"
              >
                <n-input
                  v-model:value="input"
                  type="textarea"
                  placeholder="粘贴 PEM、Base64 或 HEX 格式的证书内容，或拖放证书文件到此处..."
                  :rows="8"
                  :autosize="{ minRows: 8, maxRows: 15 }"
                />
              </div>

              <n-space>
                <n-button type="primary" @click="parseCert" :disabled="!input.trim()">
                  解析证书
                </n-button>
                <n-button @click="loadExample" secondary>
                  加载示例
                </n-button>
                <n-button @click="clearAll" :disabled="!input && !certificateInfo" tertiary>
                  清空
                </n-button>
              </n-space>
            </n-space>
          </div>

          <!-- 文件上传 -->
          <div v-else>
            <n-upload
              @change="handleFileUpload"
              :show-file-list="false"
              accept=".crt,.cer,.pem,.der"
            >
              <n-upload-dragger>
                <div style="padding: 20px">
                  <n-icon size="48">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6m4 18H6V4h7v5h5v11m-7-9v6h2v-6h3l-4-4l-4 4h3Z"/>
                    </svg>
                  </n-icon>
                  <div style="margin-top: 12px; font-size: 16px;">
                    点击或拖放证书文件到此处
                  </div>
                  <div style="margin-top: 8px; font-size: 14px; color: #999;">
                    支持 .crt, .cer, .pem, .der 格式
                  </div>
                  <div v-if="fileName" style="margin-top: 8px; color: #18a058;">
                    📎 {{ fileName }}
                  </div>
                </div>
              </n-upload-dragger>
            </n-upload>

            <n-space style="margin-top: 12px;">
              <n-button @click="clearAll" :disabled="!certificateInfo" tertiary>
                清空
              </n-button>
            </n-space>
          </div>

          <!-- 错误信息 -->
          <n-alert v-if="errorMessage" type="error" title="解析错误">
            {{ errorMessage }}
          </n-alert>
        </n-space>
      </n-card>

      <!-- 证书信息展示（类似 Windows 证书查看器） -->
      <n-card v-if="certificateInfo" title="证书信息" class="cert-info-card">
        <!-- 国密证书提示 -->
        <n-alert 
          v-if="certificateInfo.publicKey.algorithm.includes('SM2') || certificateInfo.signatureAlgorithm.includes('SM')"
          type="info" 
          title="国密证书"
          style="margin-bottom: 16px;"
        >
          此证书使用国密算法（{{ certificateInfo.signatureAlgorithm }}），符合中国商用密码标准。
        </n-alert>

        <n-tabs v-model:value="activeTab" type="line" animated>
          <!-- 常规标签 -->
          <n-tab-pane name="general" tab="常规">
            <div class="cert-section">
              <n-alert v-if="isValidCert === false" type="error" title="证书无效">
                此证书已过期或尚未生效
              </n-alert>
              <n-alert v-else-if="isValidCert === true" type="success" title="证书有效">
                此证书在有效期内
              </n-alert>

              <n-descriptions bordered :column="1" style="margin-top: 16px;">
                <n-descriptions-item label="颁发给">
                  <div class="dn-field">
                    <div><strong>CN:</strong> {{ certificateInfo.subject.CN || 'N/A' }}</div>
                    <div v-if="certificateInfo.subject.O">
                      <strong>O:</strong> {{ certificateInfo.subject.O }}
                    </div>
                    <div v-if="certificateInfo.subject.OU">
                      <strong>OU:</strong> {{ certificateInfo.subject.OU }}
                    </div>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="颁发者">
                  <div class="dn-field">
                    <div><strong>CN:</strong> {{ certificateInfo.issuer.CN || 'N/A' }}</div>
                    <div v-if="certificateInfo.issuer.O">
                      <strong>O:</strong> {{ certificateInfo.issuer.O }}
                    </div>
                    <div v-if="certificateInfo.issuer.OU">
                      <strong>OU:</strong> {{ certificateInfo.issuer.OU }}
                    </div>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="有效期">
                  <div>
                    <div><strong>生效日期:</strong> {{ formatDate(certificateInfo.validFrom) }}</div>
                    <div><strong>失效日期:</strong> {{ formatDate(certificateInfo.validTo) }}</div>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="用途">
                  <div v-if="certificateInfo.extensions">
                    <div v-for="ext in certificateInfo.extensions.filter(e => e.name === 'keyUsage' || e.name === 'extKeyUsage')" :key="ext.name">
                      {{ ext.value }}
                    </div>
                  </div>
                  <div v-else>未指定</div>
                </n-descriptions-item>
              </n-descriptions>
            </div>
          </n-tab-pane>

          <!-- 详细信息标签 -->
          <n-tab-pane name="details" tab="详细信息">
            <div class="cert-section">
              <n-descriptions bordered :column="1">
                <n-descriptions-item label="版本">
                  {{ certificateInfo.version }}
                </n-descriptions-item>

                <n-descriptions-item label="序列号">
                  <div class="copyable-field">
                    <code>{{ certificateInfo.serialNumber }}</code>
                    <n-button text @click="copyText(certificateInfo.serialNumber, '序列号')">
                      📋
                    </n-button>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="签名算法">
                  {{ certificateInfo.signatureAlgorithm }}
                </n-descriptions-item>

                <n-descriptions-item label="颁发者 DN">
                  <div class="copyable-field">
                    <code>{{ formatDistinguishedName(certificateInfo.issuer) }}</code>
                    <n-button text @click="copyText(formatDistinguishedName(certificateInfo.issuer), '颁发者')">
                      📋
                    </n-button>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="使用者 DN">
                  <div class="copyable-field">
                    <code>{{ formatDistinguishedName(certificateInfo.subject) }}</code>
                    <n-button text @click="copyText(formatDistinguishedName(certificateInfo.subject), '使用者')">
                      📋
                    </n-button>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="生效时间">
                  {{ formatDate(certificateInfo.validFrom) }}
                </n-descriptions-item>

                <n-descriptions-item label="失效时间">
                  {{ formatDate(certificateInfo.validTo) }}
                </n-descriptions-item>

                <n-descriptions-item label="公钥算法">
                  {{ certificateInfo.publicKey.algorithm }}
                </n-descriptions-item>

                <n-descriptions-item label="公钥大小">
                  {{ certificateInfo.publicKey.size }}
                </n-descriptions-item>

                <n-descriptions-item v-if="certificateInfo.publicKey.exponent" label="公钥指数">
                  {{ certificateInfo.publicKey.exponent }}
                </n-descriptions-item>

                <n-descriptions-item v-if="certificateInfo.publicKey.modulus" label="公钥模数">
                  <div class="hex-display">
                    {{ certificateInfo.publicKey.modulus }}
                  </div>
                </n-descriptions-item>

                <n-descriptions-item v-if="certificateInfo.publicKey.curve" label="椭圆曲线">
                  {{ certificateInfo.publicKey.curve }}
                </n-descriptions-item>

                <n-descriptions-item v-if="certificateInfo.publicKey.publicKey" label="公钥数据">
                  <div class="hex-display">
                    {{ certificateInfo.publicKey.publicKey }}
                  </div>
                </n-descriptions-item>
              </n-descriptions>

              <!-- 扩展 -->
              <n-divider>扩展</n-divider>
              <div v-if="certificateInfo.extensions && certificateInfo.extensions.length > 0">
                <n-collapse>
                  <n-collapse-item
                    v-for="(ext, idx) in certificateInfo.extensions"
                    :key="idx"
                    :title="`${ext.name}${ext.critical ? ' (关键)' : ''}`"
                  >
                    <pre style="white-space: pre-wrap; word-break: break-all;">{{ ext.value }}</pre>
                  </n-collapse-item>
                </n-collapse>
              </div>
              <div v-else style="color: #999;">无扩展</div>
            </div>
          </n-tab-pane>

          <!-- 指纹标签 -->
          <n-tab-pane name="fingerprints" tab="指纹">
            <div class="cert-section">
              <n-descriptions bordered :column="1">
                <n-descriptions-item label="SHA-256">
                  <div class="copyable-field">
                    <code class="fingerprint">{{ certificateInfo.fingerprints.sha256 }}</code>
                    <n-button text @click="copyText(certificateInfo.fingerprints.sha256, 'SHA-256 指纹')">
                      📋
                    </n-button>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="SHA-1">
                  <div class="copyable-field">
                    <code class="fingerprint">{{ certificateInfo.fingerprints.sha1 }}</code>
                    <n-button text @click="copyText(certificateInfo.fingerprints.sha1, 'SHA-1 指纹')">
                      📋
                    </n-button>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="MD5">
                  <div class="copyable-field">
                    <code class="fingerprint">{{ certificateInfo.fingerprints.md5 }}</code>
                    <n-button text @click="copyText(certificateInfo.fingerprints.md5, 'MD5 指纹')">
                      📋
                    </n-button>
                  </div>
                </n-descriptions-item>
              </n-descriptions>
            </div>
          </n-tab-pane>

          <!-- 原始数据标签 -->
          <n-tab-pane name="raw" tab="原始数据">
            <div class="cert-section">
              <n-space vertical :size="16">
                <div>
                  <div class="section-label">
                    <span>PEM 格式</span>
                    <n-button text @click="copyText(certificateInfo.raw.pem, 'PEM 证书')">
                      📋 复制
                    </n-button>
                  </div>
                  <n-input
                    :value="certificateInfo.raw.pem"
                    type="textarea"
                    :rows="10"
                    readonly
                    style="font-family: monospace; font-size: 12px;"
                  />
                </div>

                <div>
                  <div class="section-label">
                    <span>DER 格式 (HEX)</span>
                    <n-button text @click="copyText(certificateInfo.raw.der, 'DER 证书')">
                      📋 复制
                    </n-button>
                  </div>
                  <n-input
                    :value="certificateInfo.raw.der"
                    type="textarea"
                    :rows="10"
                    readonly
                    style="font-family: monospace; font-size: 12px;"
                  />
                </div>
              </n-space>
            </div>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </n-space>
  </div>
</template>

<style scoped>
.certificate-viewer {
  width: 100%;
}

.drop-zone {
  position: relative;
  border: 2px dashed transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.drop-zone.is-dragging {
  border-color: #18a058;
  background-color: rgba(24, 160, 88, 0.05);
}

.cert-info-card {
  margin-top: 16px;
}

.cert-section {
  padding: 16px 0;
}

.dn-field {
  font-family: monospace;
  font-size: 13px;
}

.dn-field div {
  margin: 4px 0;
}

.copyable-field {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.copyable-field code {
  flex: 1;
  word-break: break-all;
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.fingerprint {
  font-family: monospace;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.hex-display {
  font-family: monospace;
  font-size: 11px;
  word-break: break-all;
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.section-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 500;
}
</style>

