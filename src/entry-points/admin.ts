import { createApp } from 'vue';
import Admin from '../components/Admin.vue';
import type { EntryPoint } from '../types/extension';

/**
 * Admin Configuration Entry Point
 */
const adminEntryPoint: EntryPoint = ({ element }) => {
    console.log('[Admin] Initializing Vue Admin');

    const app = createApp(Admin);
    app.mount(element);

    return () => {
        console.log('[Admin] Cleaning up');
        app.unmount();
    };
};

export default adminEntryPoint;

