import { Binary } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('binary-viewer'),
  path: '/binary-viewer',
  description: translate('binary-viewer.description'),
  keywords: ['binary', 'hex', 'viewer', 'hexadecimal', 'file', 'dump', 'certificate', 'inspect'],
  component: () => import('./binary-viewer.vue'),
  icon: Binary,
});

