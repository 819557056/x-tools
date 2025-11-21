import { defineTool } from '../tool';
import { Certificate } from '@vicons/tabler';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.certificate-encoding-converter.title'),
  path: '/certificate-encoding-converter',
  description: translate('tools.certificate-encoding-converter.description'),
  keywords: ['certificate', 'encoding', 'converter', 'pem', 'der', 'base64', 'asn1', 'crt', 'cer', '证书', '编码', '转换', '二进制'],
  component: () => import('./certificate-encoding-converter.vue'),
  icon: Certificate,
  createdAt: new Date('2023-11-20'),
});