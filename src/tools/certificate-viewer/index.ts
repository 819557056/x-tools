import { defineTool } from '../tool';
import { Certificate } from '@vicons/tabler';

export const tool = defineTool({
  name: '证书查看器',
  path: '/certificate-viewer',
  description: 'X.509 证书查看器，支持多种输入格式（PEM、Base64、HEX、文件上传），以类似 Windows 证书查看器的方式展示证书详细信息',
  keywords: ['certificate', 'viewer', 'x509', 'ssl', 'tls', 'pem', 'der', '证书', '查看器'],
  component: () => import('./certificate-viewer.vue'),
  icon: Certificate,
  createdAt: new Date('2024-11-22'),
});

