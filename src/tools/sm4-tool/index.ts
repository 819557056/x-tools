import { Lock } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'SM4 加解密',
  path: '/sm4-cipher',
  description: '国密 SM4 分组密码算法，128位密钥的对称加密，支持 ECB 和 CBC 模式',
  keywords: ['sm4', 'cipher', 'encrypt', 'decrypt', '国密', 'guomi', 'chinese', 'crypto', '加密', '解密', '对称'],
  component: () => import('./sm4-tool.vue'),
  icon: Lock,
  createdAt: new Date('2024-11-22'),
});

