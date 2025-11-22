import { Key } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'SM2 非对称加密',
  path: '/sm2-crypto',
  description: '国密 SM2 椭圆曲线公钥密码算法，支持加密解密、数字签名和验签',
  keywords: ['sm2', 'ecc', 'signature', 'encrypt', 'decrypt', 'sign', 'verify', '国密', 'guomi', 'chinese', 'crypto', '加密', '解密', '签名', '验签', '非对称'],
  component: () => import('./sm2-tool.vue'),
  icon: Key,
  createdAt: new Date('2024-11-22'),
});

