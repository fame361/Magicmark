import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.log.info('[Magic-Mark] Plugin bootstrapping...');
  
  // Initialize License Guard
  try {
    const licenseGuardService = strapi.plugin('magic-mark').service('license-guard');
    
    // Wait a bit for all services to be ready
    setTimeout(async () => {
      const licenseStatus = await licenseGuardService.initialize();
      
      if (!licenseStatus.valid) {
        strapi.log.error('╔════════════════════════════════════════════════════════════════╗');
        strapi.log.error('║  [ERROR] MAGICMARK PLUGIN - NO VALID LICENSE                  ║');
        strapi.log.error('║                                                                ║');
        strapi.log.error('║  This plugin requires a valid license to operate.             ║');
        strapi.log.error('║  Please activate your license via Admin UI:                   ║');
        strapi.log.error('║  Go to Settings → MagicMark → License                         ║');
        strapi.log.error('║                                                                ║');
        strapi.log.error('║  The plugin will run with limited functionality until         ║');
        strapi.log.error('║  a valid license is activated.                                ║');
        strapi.log.error('╚════════════════════════════════════════════════════════════════╝');
      } else if (licenseStatus.valid) {
        // Get license key from store if data is not available (grace period)
        const pluginStore = strapi.store({
          type: 'plugin',
          name: 'magic-mark',
        });
        const storedKey = await pluginStore.get({ key: 'licenseKey' }) as string | undefined;
        
        strapi.log.info('╔════════════════════════════════════════════════════════════════╗');
        strapi.log.info('║  [SUCCESS] MAGICMARK PLUGIN LICENSE ACTIVE                    ║');
        strapi.log.info('║                                                                ║');
        
        if (licenseStatus.data) {
          strapi.log.info(`║  License: ${licenseStatus.data.licenseKey}                    ║`);
          strapi.log.info(`║  User: ${licenseStatus.data.firstName} ${licenseStatus.data.lastName}`.padEnd(66) + '║');
          strapi.log.info(`║  Email: ${licenseStatus.data.email}`.padEnd(66) + '║');
        } else if (storedKey) {
          strapi.log.info(`║  License: ${storedKey} (Offline Mode)                         ║`);
          strapi.log.info(`║  Status: Grace Period Active                                  ║`);
        }
        
        strapi.log.info('║                                                                ║');
        strapi.log.info('║  [PING] Auto-pinging every 15 minutes                         ║');
        strapi.log.info('╚════════════════════════════════════════════════════════════════╝');
      }
    }, 3000); // Wait 3 seconds for API to be ready
  } catch (error) {
    strapi.log.error('[ERROR] Error initializing License Guard:', error);
  }
  
  strapi.log.info('[Magic-Mark] Plugin bootstrapped successfully');
};
