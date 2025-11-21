import { defineTool } from '../tool';
import { Certificate } from '@vicons/tabler';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.certificate-parser.title'),
  path: '/certificate-parser',
  description: translate('tools.certificate-parser.description'),
  keywords: ['certificate', 'parser', 'asn1', 'x509'],
  component: () => import('./certificate-parser.vue'),
  icon: Certificate,
  createdAt: new Date('2023-11-20'),
});